import mongoose, { Schema } from 'mongoose';
import { IFavouriteJobs } from './favouritJobs.interface';

const favouriteJobSchema = new Schema<IFavouriteJobs>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobPost',
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

export const FavouriteJob = mongoose.model<IFavouriteJobs>(
  'FavouriteJob',
  favouriteJobSchema,
);
