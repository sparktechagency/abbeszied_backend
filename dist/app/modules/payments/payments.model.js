"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const payments_interface_1 = require("./payments.interface");
const paymentSchema = new mongoose_1.Schema({
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    coachId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'QAR',
    },
    paymentIntentId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(payments_interface_1.PaymentStatus),
        default: payments_interface_1.PaymentStatus.PENDING,
    },
    paymentMethod: {
        type: String,
    },
    receiptUrl: {
        type: String,
    },
    refunded: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
// Indexes for efficient queries
paymentSchema.index({ userId: 1 });
paymentSchema.index({ coachId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ paymentIntentId: 1 });
exports.Payment = (0, mongoose_1.model)('Payment', paymentSchema);
