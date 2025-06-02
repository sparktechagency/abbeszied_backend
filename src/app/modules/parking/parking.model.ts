import mongoose, { Schema } from 'mongoose';
import { IParking } from './parking.interface';

const parkingSchema = new Schema<IParking>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    spotType: { type: String, required: false },
    vihicleType: [
      {
        type: String,
        enum: ['Car', 'Truck', 'Car & Truck'],
        required: true,
      },
    ],
    slot: { type: Number, required: true },
    location: { type: String, required: true },
    locationLatLong: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    daylyPrice: { type: Number, required: true },
    weeklyPrice: { type: Number, required: true },
    images: { type: [String], required: true },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    availableDays: {
      type: [String],
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      required: true,
    },
    rules: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: 'Rule',
    },

    revenue: {
      type: Number,
      default: 10,
    },
    description: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

parkingSchema.index({ 'locationLatLong.coordinates': '2dsphere' });

const Parking = mongoose.model<IParking>('Parking', parkingSchema);

export default Parking;
