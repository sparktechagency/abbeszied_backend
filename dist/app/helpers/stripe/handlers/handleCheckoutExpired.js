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
const session_models_1 = require("../../../modules/session/session.models"); // Adjust path as needed
const handleCheckoutExpired = (session) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const bookingId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.bookingId;
        if (!bookingId) {
            console.warn('No booking ID found in expired checkout session metadata');
            return;
        }
        // Get booking details before deletion (for logging and session cleanup)
        const booking = yield booking_models_1.Booking.findById(bookingId);
        if (!booking) {
            console.warn(`Booking not found for expired session: ${bookingId}`);
            return;
        }
        // Store booking details for session cleanup
        const { sessionId, selectedDay, startTime, coachId, userId } = booking;
        // Delete the booking since the session expired
        const deletedBooking = yield booking_models_1.Booking.findByIdAndDelete(bookingId);
        if (deletedBooking) {
            console.log(`Expired checkout session. Booking deleted: ${bookingId}`);
            console.log(`Booking details: Coach ${coachId}, User ${userId}, Date ${selectedDay}, Time ${startTime}`);
            // Optional: Free up the time slot in the session model
            // Uncomment if you track booked slots in your Session model
            yield session_models_1.Session.updateOne({
                _id: sessionId,
                'dailySessions.selectedDay': selectedDay,
                'dailySessions.timeSlots.startTime12h': startTime,
            }, {
                $set: {
                    'dailySessions.$.timeSlots.$[slot].isBooked': false,
                    'dailySessions.$.timeSlots.$[slot].bookedBy': null,
                },
            }, {
                arrayFilters: [
                    { 'slot.startTime12h': startTime },
                ],
            });
            console.log(`Time slot freed: ${selectedDay} at ${startTime}`);
        }
    }
    catch (error) {
        console.error('Error handling checkout expiration:', error);
        throw error;
    }
});
exports.default = handleCheckoutExpired;
