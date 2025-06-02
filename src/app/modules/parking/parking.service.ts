import httpStatus from 'http-status';
import { IParking } from './parking.interface';
import { User } from '../user/user.models';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose from 'mongoose';

import Parking from './parking.model';
import ParkingBooking from '../booking/booking.model';
import AppError from '../../error/AppError';

const createParkingService = async (payload: IParking) => {
  const user = await User.IsUserExistById(payload?.ownerId.toString());

  if (user.role != 'business') {
    throw new AppError(httpStatus.BAD_REQUEST, 'User are not authorized!');
  }

  const result = await Parking.create(payload);
  return result;
};

//todo ! need update by location
const getAllParkingService = async (query: Record<string, unknown>) => {
  const courtQuery = new QueryBuilder(Parking.find({ isDeleted: false }), query)
    .search(['name', 'location'])
    .sort()
    .paginate();

  const result = await courtQuery.modelQuery;

  const meta = await courtQuery.countTotal();
  return { meta, result };
};

const getAllParkingByLocationService = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  // Parsing query parameters
  const lng = parseFloat(query.longitude as string);
  const lat = parseFloat(query.latitude as string);

  const maxDistance = query.distance
    ? parseInt(query.distance as string, 10) * 1000 // Convert km to meters
    : null;

  const parkingType = query.parkingType ? query.parkingType : '';
  const searchTerm = query.searchTerm ? query.searchTerm : '';
  const minPrice = query.minPrice ? parseFloat(query?.minPrice as string) : 0;
  const maxPrice = query.maxPrice
    ? parseFloat(query?.maxPrice as string)
    : Number.MAX_VALUE;

  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
  const sort = query.sort;
  const skip = (page - 1) * limit;

  // Building the aggregation pipeline
  const aggregationPipeline: any = [
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        spherical: true,
        ...(maxDistance && { maxDistance }),
      },
    },
    {
      $match: {
        isActive: true,
        isDeleted: false,
        daylyPrice: { $gte: minPrice, $lte: maxPrice },
        ...(parkingType
          ? { parkingType: { $regex: parkingType, $options: 'i' } }
          : {}),
        ...(searchTerm
          ? {
              $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } },
              ],
            }
          : {}),
      },
    },
    {
      $lookup: {
        from: 'favourites',
        let: { parkingId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$parkingId', '$$parkingId'] },
                  { $eq: ['$userId', { $toObjectId: userId }] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: 'favourite',
      },
    },
    {
      $lookup: {
        from: 'reviews',
        let: { fieldId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$fieldId', '$$fieldId'] } } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalReviewCount: { $sum: 1 },
            },
          },
        ],
        as: 'reviewsData',
      },
    },
    {
      $lookup: {
        from: 'users', // Assume 'users' collection for the owner
        localField: 'ownerId',
        foreignField: '_id',
        as: 'owner',
      },
    },
    {
      $unwind: {
        path: '$owner', // Unwind the populated owner field to access it directly
      },
    },
    {
      $match: {
        'owner.isActive': true, // Ensure the owner is active
        'owner.isDeleted': false, // Ensure the owner is not deleted
      },
    },
    {
      $addFields: {
        distanceKm: {
          $toDouble: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] },
        },
        isFavourite: { $gt: [{ $size: '$favourite' }, 0] },
        averageRating: {
          $ifNull: [{ $arrayElemAt: ['$reviewsData.averageRating', 0] }, 0],
        },
        totalReviewCount: {
          $ifNull: [{ $arrayElemAt: ['$reviewsData.totalReviewCount', 0] }, 0],
        },
      },
    },
    {
      $sort: {
        ...(sort === 'minPrice' ? { daylyPrice: 1 } : {}),
        ...(sort === 'maxPrice' ? { daylyPrice: -1 } : {}),
        distanceKm: 1,
      },
    },
    {
      $project: {
        isActive: 0,
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0,
        favourite: 0,
        reviewsData: 0,
        distanceMeters: 0,
        ownerId: 0,
        rules: 0,
        __v: 0,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ];

  const totalCount = await Parking.aggregate([
    ...aggregationPipeline.slice(0, 6), // Keep the first 6 stages for counting
    { $count: 'total' },
  ]);

  const total = totalCount.length > 0 ? totalCount[0].total : 0;
  const totalPage = Math.ceil(total / limit);

  // Perform the aggregation and get the result
  const result = await Parking.aggregate(aggregationPipeline);

  // Return the formatted response
  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    result,
  };
};

const getAllBusinessParkingService = async (
  ownerId: string,
  query: Record<string, unknown>,
) => {
  // console.log({ fieldId });
  const parkingQuery = new QueryBuilder(
    Parking.find({ ownerId, isDeleted: false }),
    query,
  )
    .search(['name', 'location'])
    .filter()
    .sort()
    .paginate();

  const result = await parkingQuery.modelQuery;

  const meta = await parkingQuery.countTotal();
  return { meta, result };
};

const getParkingDetailsforBusinessAndAdminService = async (
  parkingId: string,
) => {
  // console.log({ fieldId });
  const ressult = await Parking.find({
    _id: new mongoose.Types.ObjectId(parkingId),
  }).populate('rules');

  return ressult;
};

const getParkingDetailsByParkingIdAndLocationService = async (
  userId: string,
  parkingId: string,
  query: Record<string, unknown>,
) => {
  const lng = parseFloat(query.longitude as string);
  const lat = parseFloat(query.latitude as string);

  // console.log({ parkingId });
  // console.log({ lng });
  // console.log({ lat });

  const fields = await Parking.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceKm',
        spherical: true,
        distanceMultiplier: 0.001,
      },
    },
    {
      $match: {
        _id: new mongoose.Types.ObjectId(parkingId),
      },
    },

    {
      $lookup: {
        from: 'favourites',
        let: { parkingId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$parkingId', '$$parkingId'] },
                  { $eq: ['$userId', { $toObjectId: userId }] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: 'favourite',
      },
    },
    {
      $lookup: {
        from: 'reviews',
        let: { fieldId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$fieldId', '$$fieldId'] } } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalReviewCount: { $sum: 1 },
            },
          },
        ],
        as: 'reviewsData',
      },
    },
    {
      $lookup: {
        from: 'rules', // Add the rules lookup here
        localField: 'rules', // Reference the "rules" field in Parking
        foreignField: '_id', // Match with the _id in the rules collection
        as: 'rulesDetails', // The name of the populated field
      },
    },
    {
      $addFields: {
        isFavourite: { $gt: [{ $size: '$favourite' }, 0] },
        averageRating: {
          $ifNull: [{ $arrayElemAt: ['$reviewsData.averageRating', 0] }, 0],
        },
        totalReviewCount: {
          $ifNull: [{ $arrayElemAt: ['$reviewsData.totalReviewCount', 0] }, 0],
        },
      },
    },
    {
      $project: {
        favourite: 0,
        reviewsData: 0,
        createdAt: 0,
        updatedAt: 0,
        isActive: 0,
        isDeleted: 0,
        rules: 0,
        ownerId: 0,
        __v: 0,
      },
    },
  ]);

  return fields?.[0];
};

const getBookingsForNext30Days = async (parkingId: string, date?: string) => {
  // Default to today's date if no date is passed
  let startDate = new Date(); // Start date is today's date
  let endDate = new Date();

  // If a custom date is passed in dd-mm-yyyy format, convert it

  if (date) {
    startDate = new Date(date); // Convert to Date object
    if (isNaN(startDate.getTime())) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid date format');
    }
    endDate = new Date(startDate);
  }

  // console.log({ startDate });
  // console.log({ endDate });

  // Set end date to 30 days from the start date
  endDate.setDate(startDate.getDate() + 30);

  const totalDays = 30; // We are interested in the next 30 days

  try {
    // Step 1: Fetch the parking details (e.g., available slots)
    const parkingDetails = await Parking.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(parkingId) } },
      { $project: { slot: 1 } }, // Only project the `slot` field (available slots)
    ]);

    // If no parking details are found, throw an error
    if (!parkingDetails.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Parking not found');
    }

    const { slot } = parkingDetails[0]; // Get the available slot count for this parking

    // Step 2: Aggregate bookings per day for the next 30 days

    const bookingsPerDay = await ParkingBooking.aggregate([
      {
        $match: {
          parkingId: new mongoose.Types.ObjectId(parkingId),
          bookingStartDate: { $gte: startDate, $lt: endDate }, // Match bookings in the desired date range
          bookingEndtDate: { $gte: startDate, $lt: endDate }, // Ensure that bookingEndDate is also in the range
        },
      },
      {
        $addFields: {
          // Generate the range of dates between bookingStartDate and bookingEndtDate (inclusive)
          dateRange: {
            $map: {
              input: {
                $range: [
                  0, // Starting index for the range
                  {
                    $subtract: [
                      { $toLong: '$bookingEndtDate' },
                      { $toLong: '$bookingStartDate' },
                    ],
                  }, // Calculate the difference in days
                  86400000, // Step of 1 day (86400000 ms in a day)
                ],
              },
              as: 'date',
              in: {
                $dateAdd: {
                  startDate: '$bookingStartDate',
                  unit: 'millisecond',
                  amount: '$$date',
                },
              }, // Add the date offset to startDate
            },
          },
        },
      },
      {
        $unwind: '$dateRange', // Unwind the dateRange array
      },
      {
        $project: {
          day: { $dayOfMonth: '$dateRange' },
          month: { $month: '$dateRange' },
          year: { $year: '$dateRange' },
        },
      },
      {
        $group: {
          _id: {
            day: '$day',
            month: '$month',
            year: '$year',
          },
          book: { $sum: 1 }, // Count the number of bookings for that day
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }, // Sort by year, month, and day
      },
    ]);

    // Step 3: Prepare the final results for the next 30 days
    const dailyBookingCounts = [];
    let firstUnavailableDate = null; // Variable to store the last available date (when the slot is fully booked)

    // Loop through each day (from 1 to 30) and populate data
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i); // Move to the next day

      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScript
      const year = currentDate.getFullYear();

      // Find the booking count for the current day
      const bookingForDay = bookingsPerDay.find(
        (booking) =>
          booking._id.day === day &&
          booking._id.month === month &&
          booking._id.year === year,
      );
      const bookCount = bookingForDay ? bookingForDay.book : 0;

      // Availability is determined by the booking count and available slots
      const isAvailable = bookCount < slot;

      // If the day is fully booked, update the firstUnavailableDate
      if (!isAvailable && !firstUnavailableDate) {
        firstUnavailableDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year.toString().slice(-2)}`;
      }

      // Format the date as dd-mm-yy
      const formattedDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year.toString().slice(-2)}`;

      // Push the data to the result array
      dailyBookingCounts.push({
        date: formattedDate,
        slot,
        book: bookCount,
        isAvailable,
      });
    }

    // Return the result with lastAvailable date and date data
    return {
      firstUnavailableDate: firstUnavailableDate || null, // Return null if no fully booked day
      dateData: dailyBookingCounts,
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { lastAvailable: null, dateData: [] }; // Return empty data in case of an error
  }
};

// Utility function to convert dd-mm-yyyy to yyyy-mm-dd

const updateParkingService = async (
  parkingId: string,
  ownerId: string,
  payload: IParking,
) => {
  const user = await User.IsUserExistById(ownerId.toString());

  if (user.role != 'business') {
    throw new AppError(httpStatus.BAD_REQUEST, 'User are not authorized!');
  }

  const field = await Parking.findOne({
    _id: new mongoose.Types.ObjectId(parkingId),
    ownerId,
  });

  // console.log({ payload });
  if (!field) {
    throw new AppError(httpStatus.NOT_FOUND, 'Not found this parking spot.');
  }

  const { revenue, ...rest } = payload;

  const result = await Parking.findByIdAndUpdate(parkingId, rest, {
    new: true,
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update court!!');
  }
  return result;
};

const switchParkingStatusService = async (
  ownerId: string,
  parkingId: string,
  revenue?: string,
) => {
  const user = await User.IsUserExistById(ownerId.toString());

  if (!(user.role == 'business' || user.role == 'admin')) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User are not authorized!');
  }

  let filter: any = {
    _id: new mongoose.Types.ObjectId(parkingId),
  };

  if (user.role == 'business') {
    filter.ownerId = ownerId;
  }
  const parkingSpot = await Parking.findOne(filter);

  // console.log({ payload });
  if (!parkingSpot) {
    throw new AppError(httpStatus.NOT_FOUND, 'Not found parking spot.');
  }

  let updatePayload: any = { isActive: !parkingSpot.isActive };

  console.log('revenue');
  console.log(revenue);
  console.log('user.role');
  console.log(user.role);
  if (revenue && user.role == 'admin') {
    updatePayload = { revenue };
  }

  console.log('updatePayload');
  console.log(updatePayload);

  const result = await Parking.findByIdAndUpdate(parkingId, updatePayload, {
    new: true,
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update court!!');
  }
  return result;
};

const deleteParkingService = async (parkingId: string, ownerId: string) => {
  const user = await User.IsUserExistById(ownerId.toString());

  if (user.role != 'business') {
    throw new AppError(httpStatus.BAD_REQUEST, 'User are not authorized!');
  }

  const field = await Parking.findOne({
    _id: new mongoose.Types.ObjectId(parkingId),
    ownerId,
  });

  // console.log({ payload });
  if (!field) {
    throw new AppError(httpStatus.NOT_FOUND, 'Not found this parking spot.');
  }

  const result = await Parking.findByIdAndUpdate(
    parkingId,
    { isDeleted: true },
    {
      new: true,
    },
  );

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update court!!');
  }

  return result;
};

export const parkingService = {
  createParkingService,
  getAllParkingService,
  getAllParkingByLocationService,
  getAllBusinessParkingService,
  getParkingDetailsforBusinessAndAdminService,
  getParkingDetailsByParkingIdAndLocationService,
  getBookingsForNext30Days,
  updateParkingService,
  switchParkingStatusService,
  deleteParkingService,
};
