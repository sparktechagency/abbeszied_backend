import { IReview } from './review.interface';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { Review } from './review.model';
import mongoose from 'mongoose';

const createReviewToDB = async (payload: IReview): Promise<IReview> => {
  const result = await Review.create(payload);

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Review');
  }

  return result; // Return the created review
};
const deleteReviewToDB = async (id: string) => {
  const result = await Review.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed To delete Review');
  }
  return result;
};

const getReviewAnalysis = async (id: string) => {
  const stats = await Review.aggregate([
    {
      $match: {
        coachId: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  if (!stats) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No reviews found for this tutorial',
    );
  }

  // Calculate average rating
  const totalReviews = stats.reduce((sum, stat) => sum + stat.count, 0);
  const averageRating =
    stats.reduce((sum, stat) => sum + stat._id * stat.count, 0) / totalReviews;

  // Prepare rating distribution with default values for missing ratings
  const ratingDistribution = {
    rating1: 0,
    rating2: 0,
    rating3: 0,
    rating4: 0,
    rating5: 0,
  };

  stats.forEach((stat) => {
    (ratingDistribution as { [key: string]: number })[`rating${stat._id}`] =
      stat.count;
  });

  return {
    success: true,
    message: 'Review analysis retrieved Successfully',
    data: {
      averageRating: averageRating.toFixed(1),
      reviewCount: totalReviews,
      ...ratingDistribution,
    },
  };
};

const getReviews = async (coachId: string, query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Review.find({ coachId }).populate({
      path: 'clientId',
      select: 'fullName email image',
    }),
    query,
  );
  const review = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();
  return {
    review,
    meta,
  };
};
export const ReviewService = {
  createReviewToDB,
  deleteReviewToDB,
  getReviewAnalysis,
  getReviews,
};
