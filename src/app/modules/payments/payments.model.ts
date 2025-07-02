import { Schema, model } from 'mongoose';
import { IPayment, PaymentStatus } from './payments.interface';

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coachId: {
      type: Schema.Types.ObjectId,
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
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

// Indexes for efficient queries
paymentSchema.index({ userId: 1 });
paymentSchema.index({ coachId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ paymentIntentId: 1 });

export const Payment = model<IPayment>('Payment', paymentSchema);
