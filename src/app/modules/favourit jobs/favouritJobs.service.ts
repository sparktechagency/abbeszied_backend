// ===== SERVICE =====
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { FavouriteJob } from './favouritJobs.model';
import path from 'path';

const toggleFavouriteJob = async (userId: string, jobId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingFavourite = await FavouriteJob.findOne({
      userId,
      jobId,
    }).session(session);

    if (existingFavourite) {
      // Remove from favourites
      await FavouriteJob.deleteOne({ userId, jobId }).session(session);
      await session.commitTransaction();
      return {
        isFavourite: false,
        message: 'Job removed from favourites',
      };
    } else {
      // Add to favourites
      const newFavourite = new FavouriteJob({ userId, jobId });
      await newFavourite.save({ session });
      await session.commitTransaction();
      return {
        isFavourite: true,
        message: 'Job added to favourites',
      };
    }
  } catch (error) {
    await session.abortTransaction();
    console.error('Error during favourite toggle process:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'An error occurred while processing your favourite action',
    );
  } finally {
    session.endSession();
  }
};

const removeFavouriteJob = async (userId: string, jobId: string) => {
  const favouriteJob = await FavouriteJob.findOne({ userId, jobId });

  if (!favouriteJob) {
    throw new AppError(httpStatus.NOT_FOUND, 'Job not found in favourites');
  }

  const deletedFavourite = await FavouriteJob.findByIdAndDelete(
    favouriteJob._id,
  );

  if (!deletedFavourite) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to remove Job from favourites',
    );
  }

  return deletedFavourite;
};

const getFavouriteJobs = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    FavouriteJob.find({ userId }).populate({
      path: 'jobId',
      populate: {
        path: 'postedBy',
        select: 'fullName image language category',
      },
    }),
    query,
  );

  const favouriteJobs = await queryBuilder
    .fields()
    .paginate()
    .sort()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  return {
    favouriteJobs,
    meta,
  };
};

export const FavouriteJobServices = {
  toggleFavouriteJob,
  removeFavouriteJob,
  getFavouriteJobs,
};
