import { model, Schema } from 'mongoose';
import { TReview } from './ratings.interface';

const reviewSchema = new Schema<TReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    parkingId: {
      type: Schema.Types.ObjectId,
      ref: 'Parking',
    },
    rating: {
      type: Number,
    },
    review: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['field', 'admin'],
      default: 'field',
    },
  },
  { timestamps: true },
);

export const Review = model<TReview>('Review', reviewSchema);
