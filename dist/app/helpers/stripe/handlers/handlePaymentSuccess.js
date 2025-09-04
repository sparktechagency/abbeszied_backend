"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const booking_models_1 = require("../../../modules/booking/booking.models");
const booking_interface_1 = require("../../../modules/booking/booking.interface");
const session_models_1 = require("../../../modules/session/session.models");
const genereteNumber_1 = __importDefault(require("../../../utils/genereteNumber"));
const sendNotification_1 = require("../../sendNotification");
const user_models_1 = require("../../../modules/user/user.models");
const AppError_1 = __importDefault(require("../../../error/AppError"));
const handlePaymentSuccess = (checkoutSession) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const bookingId = (_a = checkoutSession.metadata) === null || _a === void 0 ? void 0 : _a.bookingId;
    const paymentIntentId = checkoutSession.payment_intent;
    if (!bookingId) {
        console.error('No booking ID in checkout session metadata');
        return;
    }
    if (!paymentIntentId) {
        console.error('No payment intent ID in checkout session');
        return;
    }
    // Start a database transaction for data consistency
    const session = yield mongoose_1.default.startSession();
    let booking; // Declare booking variable in outer scope
    try {
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Update booking status with atomic operation - INCLUDING paymentIntentId
            booking = yield booking_models_1.Booking.findByIdAndUpdate(bookingId, {
                bookingStatus: booking_interface_1.BookingStatus.CONFIRMED,
                paymentStatus: booking_interface_1.PaymentStatus.PAID,
                paymentIntentId: paymentIntentId, // Store payment intent ID for refunds
                orderNumber: (0, genereteNumber_1.default)('ORD#'),
            }, { new: true, session });
            if (!booking) {
                throw new AppError_1.default(404, `Booking not found: ${bookingId}`);
            }
            // 2. Update session time slot atomically
            const sessionUpdateResult = yield session_models_1.Session.findOneAndUpdate({
                _id: booking.sessionId,
                'dailySessions.selectedDay': booking.selectedDay,
                'dailySessions.timeSlots.startTime12h': booking.startTime,
            }, {
                $set: {
                    'dailySessions.$[session].timeSlots.$[slot].isBooked': true,
                    'dailySessions.$[session].timeSlots.$[slot].clientId': booking.userId,
                },
            }, {
                arrayFilters: [
                    { 'session.selectedDay': booking.selectedDay },
                    { 'slot.startTime12h': booking.startTime, 'slot.isBooked': false },
                ],
                session,
            });
            if (!sessionUpdateResult) {
                throw new AppError_1.default(400, `Failed to update session or time slot already booked for booking: ${bookingId}`);
            }
            // 3. Update user's total spend atomically (prevents race conditions)
            const updatedUser = yield user_models_1.User.findByIdAndUpdate(booking.userId, { $inc: { totalSpend: booking.price } }, { session, new: true });
            if (!updatedUser) {
                throw new AppError_1.default(404, `User not found: ${booking.userId}`);
            }
            // 4. Update coach's total earned atomically
            const updatedCoach = yield user_models_1.User.findByIdAndUpdate(booking.coachId, { $inc: { totalEarned: booking.price } }, { session, new: true });
            if (!updatedCoach) {
                throw new AppError_1.default(404, `Coach not found: ${booking.coachId}`);
            }
            console.log(`Payment success processed for booking: ${bookingId}, PaymentIntent: ${paymentIntentId}`);
        }));
        // 5. Send notification outside transaction to avoid rollback on notification failure
        try {
            const client = yield user_models_1.User.findById(booking.userId).select('fullName');
            yield (0, sendNotification_1.sendNotifications)({
                receiver: booking.coachId,
                type: 'BOOKING',
                message: `You have a new client booking with client ${client === null || client === void 0 ? void 0 : client.fullName}`,
            });
        }
        catch (notificationError) {
            console.error('Failed to send notification:', notificationError);
            // Don't throw - payment processing was successful
        }
    }
    catch (error) {
        console.error('Error handling payment success:', error);
        throw error; // Re-throw to let caller handle if needed
    }
    finally {
        yield session.endSession();
    }
});
exports.default = handlePaymentSuccess;
