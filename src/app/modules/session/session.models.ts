import { Schema, model } from 'mongoose';
import { ISession } from './session.interface';

const timeSlotSchema = new Schema(
  {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const sessionSchema = new Schema<ISession>(
  {
    pricePerSession: {
      type: Number,
      required: true,
    },
    selectedDay: {
      type: Date,
      required: true,
    },
    timeSlots: {
      type: [timeSlotSchema],
      required: true,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);
export const Session = model<ISession>('Session', sessionSchema);
