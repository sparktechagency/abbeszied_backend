import { model, Schema } from 'mongoose';
import {
  BookingStatus,
  IBooking,
  PaymentStatus,
  SessionStatus,
  SessionType,
} from './booking.interface';

const bookingSchema = new Schema<IBooking>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
      default: SessionType.TRIAL,
    },
    bookingStatus: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
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
      enum: Object.values(SessionStatus),
      default: SessionStatus.PENDING,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

// Indexes for faster queries
bookingSchema.index({ userId: 1 });
bookingSchema.index({ coachId: 1 });
bookingSchema.index({ selectedDay: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ paymentIntentId: 1 });
bookingSchema.index({ createdAt: 1 });

// Compound indexes
bookingSchema.index({ userId: 1, bookingStatus: 1 });
bookingSchema.index({ coachId: 1, bookingStatus: 1 });
bookingSchema.index({ selectedDay: 1, startTime: 1 });

// Prevent duplicate confirmed bookings for same slot
bookingSchema.index(
  {
    coachId: 1,
    selectedDay: 1,
    startTime: 1,
    bookingStatus: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      bookingStatus: { $in: [BookingStatus.CONFIRMED] },
    },
  },
);

// TTL index for pending bookings (auto-delete after 30 minutes)
bookingSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 1800, // 30 minutes
    partialFilterExpression: {
      bookingStatus: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    },
  },
);

export const Booking = model<IBooking>('Booking', bookingSchema);
