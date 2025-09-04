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
const booking_interface_1 = require("../../../modules/booking/booking.interface");
// Handle failed payment
const handlePaymentFailed = (paymentIntent) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingId = paymentIntent.metadata.bookingId;
    if (!bookingId) {
        console.error('No booking ID in payment intent metadata');
        return;
    }
    // Update booking status
    yield booking_models_1.Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: booking_interface_1.PaymentStatus.FAILED,
    });
    console.log(`Payment failed for booking: ${bookingId}`);
});
exports.default = handlePaymentFailed;
