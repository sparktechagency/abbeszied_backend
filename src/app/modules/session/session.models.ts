import { Schema, model } from 'mongoose';
import { ISession } from './session.interface';

const timeSlotSchema = new Schema(
  {
    startTime: {
      type: String,
      required: true,
    },
    startTime12h: {
      type: String,
      required: false,
    },
    endTime: {
      type: String,
      required: true,
    },
    endTime12h: {
      type: String,
      required: false,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    _id: false,
  },
);

const dailySessionSchema = new Schema(
  {
    selectedDay: {
      type: Date,
      required: true,
    },
    timeSlots: {
      type: [timeSlotSchema],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
    aboutMe: {
      type: String,
      required: true,
    },
    dailySessions: {
      type: [dailySessionSchema],
      default: [],
    },
    language: {
      type: [String],
      default: [],
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Ensures one session document per coach
    },
    category: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
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

// Index for better query performance
sessionSchema.index({ 'dailySessions.selectedDay': 1, coachId: 1 });
sessionSchema.index({ sessionPackage: 1 });

export const Session = model<ISession>('Session', sessionSchema);
