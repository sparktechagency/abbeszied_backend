import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TReview } from './ratings.interface';
import { Review } from './ratings.model';

const createReviewService = async (payload: TReview) => {
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // console.log({ payload });

  const result = await Review.create(payload);

  return result;
};

const getAllReviewByBusinessQuery = async (
  query: Record<string, unknown>,
  parkingId: string,
) => {
  const reviewQuery = new QueryBuilder(
    Review.find({ parkingId })
      // .populate('fieldId')
      .populate('userId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();
  return { meta, result };
};

export const reviewService = {
  createReviewService,
  getAllReviewByBusinessQuery,
};
