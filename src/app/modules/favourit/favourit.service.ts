// ===== SERVICE =====
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { Favourite } from './favourit.model';

const toggleFavouriteCoach = async (userId: string, sessionId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingFavourite = await Favourite.findOne({
      userId,
      sessionId,
    }).session(session);

    if (existingFavourite) {
      // Remove from favourites
      await Favourite.deleteOne({ userId, sessionId }).session(session);
      await session.commitTransaction();
      return {
        isFavourite: false,
        message: 'Coach removed from favourites',
      };
    } else {
      // Add to favourites
      const newFavourite = new Favourite({ userId, sessionId });
      await newFavourite.save({ session });
      await session.commitTransaction();
      return {
        isFavourite: true,
        message: 'Coach added to favourites',
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

const removeFavouriteCoach = async (userId: string, sessionId: string) => {
  const favouriteCoach = await Favourite.findOne({ userId, sessionId });

  if (!favouriteCoach) {
    throw new AppError(httpStatus.NOT_FOUND, 'Coach not found in favourites');
  }

  const deletedFavourite = await Favourite.findByIdAndDelete(
    favouriteCoach._id,
  );

  if (!deletedFavourite) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to remove coach from favourites',
    );
  }

  return deletedFavourite;
};

const getFavouriteCoaches = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    Favourite.find({ userId }).populate({
      path: 'sessionId',
      select: 'name pricePerSession',
      populate: {
        path: 'coachId',
        select: 'fullName image language category',
      },
    }),
    query,
  );

  const favouriteCoaches = await queryBuilder
    .fields()
    .paginate()
    .sort()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  return {
    favouriteCoaches,
    meta,
  };
};



export const FavouriteCoachServices = {
  toggleFavouriteCoach,
  removeFavouriteCoach,
  getFavouriteCoaches,
};
