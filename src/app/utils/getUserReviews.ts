import mongoose from 'mongoose';
import { Review } from '../modules/review/review.model';

const getUserReview = async (id: string) => {
  // Aggregation to get reviews by rating
  const reting = await Review.aggregate([
    {
      $match: { coachId: new mongoose.Types.ObjectId(id) },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  if (!reting || reting.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  // Calculate the total count of reviews
  const totalReviews = reting.reduce(
    (sum: number, item: any) => sum + item.count,
    0,
  );

  // Calculate the average rating
  const averageRating =
    reting.reduce((sum: number, item: any) => sum + item._id * item.count, 0) /
    totalReviews;

  return {
    averageRating,
    totalReviews,
  };
};

export default getUserReview;
