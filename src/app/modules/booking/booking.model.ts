import mongoose, { Schema } from 'mongoose';
import { IParkingBooking } from './booking.interface';

const counterSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    sequenceValue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Counter = mongoose.model('Counter', counterSchema);

const parkingBookingSchema = new Schema<IParkingBooking>(
  {
    bookingId: {
      type: String,
      unique: true,
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    parkingId: {
      type: Schema.Types.ObjectId,
      ref: 'Parking',
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['day', 'week'],
      required: true,
    },
    bookingStartDate: { type: Date, default: Date.now, required: true },
    bookingEndtDate: { type: Date, default: Date.now, required: true },
    checkInTime: { type: String, required: false },
    perdayPrice: { type: Number, required: false },
    totalDays: { type: Number, required: false },
    perWeekPrice: { type: Number, required: false },
    totalWeeks: { type: Number, required: false },
    totalPrice: { type: Number, required: true },
    vihicleType: {
      type: String,
      enum: ['Car', 'Truck', 'Car & Truck'],
      required: true,
    },
    vihicleModel: { type: String, required: false },
    vihicleLicensePlate: { type: String, required: false },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'upcoming', 'processing', 'paid'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

parkingBookingSchema.pre('save', async function (next) {
  console.log(" parkingBookingSchema'", !this.bookingId);
  if (!this.bookingId) {
    console.log(" !this.bookingId'");
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: 'bookingId' },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true },
      );

      const bookingId = counter.sequenceValue.toString().padStart(6, '0');
      this.bookingId = bookingId;

      console.log('this');
      console.log(this);

      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

const ParkingBooking = mongoose.model<IParkingBooking>(
  'ParkingBooking',
  parkingBookingSchema,
);

export default ParkingBooking;
