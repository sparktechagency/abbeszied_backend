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
Object.defineProperty(exports, "__esModule", { value: true });
const booking_models_1 = require("../../../modules/booking/booking.models");
const sendNotification_1 = require("../../sendNotification");
const user_models_1 = require("../../../modules/user/user.models");
// Handle canceled payment
const handlePaymentCanceled = (paymentIntent) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingId = paymentIntent.metadata.bookingId;
    if (!bookingId) {
        console.error('No booking ID in payment intent metadata');
        return;
    }
    const booking = yield booking_models_1.Booking.findById(bookingId);
    if (!booking) {
        console.error('No booking found with the provided ID');
        return;
    }
    const client = yield user_models_1.User.findById(booking === null || booking === void 0 ? void 0 : booking.userId);
    yield user_models_1.User.findByIdAndUpdate(booking === null || booking === void 0 ? void 0 : booking.userId, {
        $inc: { totalSpend: -booking.price },
    });
    // Reverse coach's total earned
    yield user_models_1.User.findByIdAndUpdate(booking === null || booking === void 0 ? void 0 : booking.coachId, {
        $inc: { totalEarned: -booking.price },
    });
    yield (0, sendNotification_1.sendNotifications)({
        receiver: booking === null || booking === void 0 ? void 0 : booking.coachId,
        type: 'CANCELLED',
        message: `Your client ${client === null || client === void 0 ? void 0 : client.fullName} has canceled the booking`,
    });
    // Delete the booking since payment was canceled
    yield booking_models_1.Booking.findByIdAndDelete(bookingId);
});
exports.default = handlePaymentCanceled;
