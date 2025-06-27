import mongoose, { Schema } from 'mongoose';
import { IFavourite } from './favourit.interface';

const favouriteSchema = new Schema<IFavourite>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session', // Changed from 'Session' to 'Coach' for clarity
      required: true,
      index: true,
    },
    isFavourite: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Ensure one favourite record per user-coach pair
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index for efficient queries
favouriteSchema.index({ userId: 1, coachId: 1 }, { unique: true });
export const Favourite = mongoose.model<IFavourite>(
  'Favourite',
  favouriteSchema,
);
