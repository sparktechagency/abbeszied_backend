"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = require("mongoose");
const booking_interface_1 = require("./booking.interface");
const bookingSchema = new mongoose_1.Schema({
    sessionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
    },
    coachId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderNumber: {
        type: String,
        default: '',
    },
    selectedDay: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    sessionPackage: {
        type: String,
        default: booking_interface_1.SessionType.TRIAL,
    },
    bookingStatus: {
        type: String,
        enum: Object.values(booking_interface_1.BookingStatus),
        default: booking_interface_1.BookingStatus.PENDING,
    },
    paymentStatus: {
        type: String,
        enum: Object.values(booking_interface_1.PaymentStatus),
        default: booking_interface_1.PaymentStatus.PENDING,
    },
    paymentIntentId: {
        type: String,
    },
    cancellationReason: {
        type: String,
    },
    rescheduleReason: {
        type: String,
    },
    isRescheduled: {
        type: Boolean,
        default: false,
    },
    rescheduleCount: {
        type: Number,
        default: 0,
    },
    lastRescheduledAt: {
        type: Date,
    },
    sessionStatus: {
        type: String,
        enum: Object.values(booking_interface_1.SessionStatus),
        default: booking_interface_1.SessionStatus.PENDING,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
// Indexes for faster queries
bookingSchema.index({ userId: 1 });
bookingSchema.index({ coachId: 1 });
bookingSchema.index({ selectedDay: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ paymentIntentId: 1 });
// Compound indexes
bookingSchema.index({ userId: 1, bookingStatus: 1 });
bookingSchema.index({ coachId: 1, bookingStatus: 1 });
bookingSchema.index({ selectedDay: 1, startTime: 1 });
// Prevent duplicate confirmed bookings for same slot
bookingSchema.index({
    coachId: 1,
    selectedDay: 1,
    startTime: 1,
    bookingStatus: 1,
}, {
    unique: true,
    partialFilterExpression: {
        bookingStatus: { $in: [booking_interface_1.BookingStatus.CONFIRMED] },
    },
});
// TTL index for pending bookings (auto-delete after 30 minutes)
bookingSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 1800, // 30 minutes
    partialFilterExpression: {
        bookingStatus: booking_interface_1.BookingStatus.PENDING,
        paymentStatus: booking_interface_1.PaymentStatus.PENDING,
    },
});
exports.Booking = (0, mongoose_1.model)('Booking', bookingSchema);
