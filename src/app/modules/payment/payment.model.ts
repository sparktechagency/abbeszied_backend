import mongoose, { Schema } from 'mongoose';
import { IPayment } from './payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ParkingBooking',
    },
    parkingId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Parking',
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    businessOwnerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    adminCommission: { type: String, required: true },
    adminRevenue: { type: Number, required: true },
    paymentIntent: { type: String, required: true, unique: true },
    totalPrice: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
