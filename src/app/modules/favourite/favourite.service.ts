import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { TFavourite } from './favourite.interface';
import Favourite from './favourite.model';

const createFavourite = async (payload: TFavourite) => {
  // console.log({ payload });
  const isExist = await Favourite.findOne(payload);
  if (isExist) {
    const data = await Favourite.findByIdAndDelete(isExist._id);
    return { data, message: 'Delete successfully' };
  } else {
    const data = await Favourite.create(payload);
    return { data, message: 'Favourite added successfully' };
  }
};

const getMyFavouriteListService = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;

  // Calculate the skip value based on page and limit
  const skip = (page - 1) * limit;

  const total = await Favourite.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
  });

  const totalPage = Math.ceil(total / limit);

  const meta = {
    page,
    limit,
    total,
    totalPage,
  };

  // Retrieve favorites with pagination and calculate average rating and total reviews for each field
  const favourite = await Favourite.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'parkings',
        localField: 'parkingId',
        foreignField: '_id',
        as: 'parking',
      },
    },
    // {
    //   $unwind: '$parking', // Unwind the dateRange array
    // },
    {
      $lookup: {
        from: 'reviews',
        let: { parkingId: '$parkingId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$parkingId', '$$parkingId'] },
            },
          },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        as: 'reviewsData',
      },
    },
    {
      $addFields: {
        parking: { $arrayElemAt: ['$parking', 0] },
        averageRating: {
          $ifNull: [{ $arrayElemAt: ['$reviewsData.averageRating', 0] }, 0],
        },
        totalReviews: {
          $ifNull: [{ $arrayElemAt: ['$reviewsData.totalReviews', 0] }, 0],
        },
      },
    },
    {
      $project: {
        _id: 1,
        parkingId: 1,
        averageRating: 1,
        totalReviews: 1,
        parking: '$parking',
        // fieldName: '$field.fieldName',
        // location: '$field.location',
        // fieldImages: '$field.fieldImages',
        // distance: '$field.distance',
      },
    },
  ]);

  return { meta, favourite };
};

export const favouriteService = {
  createFavourite,
  getMyFavouriteListService,
};
