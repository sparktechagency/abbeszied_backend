import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IParkingBooking } from './booking.interface';
import ParkingBooking from './booking.model';
import Parking from '../parking/parking.model';
import stripe from '../../config/stripe.config';
import { User } from '../user/user.models';
import { USER_ROLE } from '../user/user.constants';
import config from '../../config';
import mongoose from 'mongoose';

const createParkingBookingWebHookService = async (payload: IParkingBooking) => {
  const {
    userId,
    parkingId,
    bookingStartDate,
    bookingEndtDate,
    totalPrice,
  }: any = payload;

  console.log({ payload });

  const parkingDoc = await Parking.findById(parkingId);

  if (!parkingDoc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Not found!');
  }

  if (bookingEndtDate) {
    const endOfDay = new Date(bookingEndtDate);
    endOfDay.setHours(23, 59, 59, 999); // Set the time to 23:59:59.999 (end of the day)
    payload.bookingEndtDate = endOfDay;
  }

  const bookingStartDateUpdate: any = new Date(bookingStartDate);
  const bookingEndtDateUpdate: any = new Date(bookingEndtDate);

  const timeDifference = bookingEndtDateUpdate - bookingStartDateUpdate;
  const daysDifference = timeDifference / (1000 * 3600 * 24) + 1;

  console.log(daysDifference);

  // Convert milliseconds to days
  // const daysDifference: number = timeDifference / (1000 * 3600 * 24);

  let totalAmount;

  if (payload.bookingType === 'day') {
    payload.perdayPrice = parkingDoc.daylyPrice as number;
    payload.totalDays = daysDifference;

    totalAmount = parkingDoc.daylyPrice * daysDifference;
  } else if (payload.bookingType === 'week') {
    const totalWeeks = Math.ceil(daysDifference / 7);
    payload.perWeekPrice = parkingDoc.weeklyPrice;
    payload.totalWeeks = totalWeeks;

    totalAmount = parkingDoc.weeklyPrice * totalWeeks;
  }

  if (totalAmount != totalPrice || !parkingDoc) {
    console.log({ totalAmount });
    console.log({ totalPrice });
    throw new AppError(httpStatus.BAD_REQUEST, 'Total price not matched!');
  }

  const isUserExist = await User.IsUserExistById(userId);

  console.log({
    email: isUserExist.email,
    name: isUserExist.fullName,
  });

  let stripeCustomer;

  try {
    stripeCustomer = await stripe.customers.create({
      email: isUserExist.email,
      name: isUserExist.fullName,
    });
  } catch (error) {
    console.log(error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create Stripe customer',
    );
  }

  await User.findOneAndUpdate(
    { _id: userId, stripeCustomerId: '' },
    { $set: { stripeCustomerId: stripeCustomer.id } },
  );

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomer.id,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Amount',
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: payload.userId.toString(),
        parkingId: payload.parkingId.toString(),
        bookingStartDate: payload.bookingStartDate.toString(),
        bookingEndtDate: payload.bookingEndtDate.toString(),
        checkInTime: payload.checkInTime.toString(),
        bookingType: payload.bookingType,
        vihicleType: payload.vihicleType,
        vihicleModel: payload.vihicleModel,
        vihicleLicensePlate: payload.vihicleLicensePlate,
        perdayPrice: parkingDoc.daylyPrice as number,
        totalDays: daysDifference,
        perWeekPrice: parkingDoc.weeklyPrice,
        totalWeeks: Math.ceil(daysDifference / 7),
        totalPrice: totalPrice,
      },
      success_url: config.stripe.success_url,
      cancel_url: config.stripe.cancel_url,
    });
    console.log({
      url: session.url,
    });
    return {
      url: session.url,
    };
  } catch (error) {
    console.log(error);
  }
};

const addParkingBookingService = async (payload: any) => {
  const parkingDoc = await Parking.findById(payload.parkingId);

  if (!parkingDoc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Not found!');
  }

  payload.paymentStatus = 'paid';

  console.log(" payload.paymentStatus = 'paid'");

  const newParkingBooking = await ParkingBooking.create(payload);

  return newParkingBooking;
};

const getBookingService = async (
  userId: string,
  role: string,
  query: Record<string, unknown>,
) => {
  const currentDate = new Date();
  const searchTerm = query.searchTerm ? query.searchTerm : '';
  const status = query.status ? query.status : '';
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = query.limit ? parseInt(query.limit as string, 10) : 10;

  const skip = (page - 1) * limit;

  const aggregationPipeline: any = [
    // Step 1: Lookup the userId to populate the user details
    {
      $lookup: {
        from: 'users', // Collection name for the User model
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true, // Optional: preserve bookings without users
      },
    },

    // Step 2: Lookup the parkingId to match the ownerId
    {
      $lookup: {
        from: 'parkings', // Collection name for Parking model
        localField: 'parkingId',
        foreignField: '_id',
        as: 'parking',
      },
    },
    {
      $unwind: {
        path: '$parking',
        preserveNullAndEmptyArrays: true, // Optional: preserve bookings without parking
      },
    },

    {
      $match: {
        ...(role === 'business'
          ? {
              'parking.ownerId': new mongoose.Types.ObjectId(userId),
            }
          : { userId: new mongoose.Types.ObjectId(userId) }),
        ...(searchTerm
          ? {
              $or: [
                { bookingId: { $regex: searchTerm, $options: 'i' } },
                { 'user.fullName': { $regex: searchTerm, $options: 'i' } },
              ],
            }
          : {}),
      },
    },
    {
      $addFields: {
        status: {
          $cond: {
            if: { $lt: [currentDate, '$bookingStartDate'] }, // if current date is before booking start date
            then: 'Waiting',
            else: {
              $cond: {
                if: {
                  $and: [
                    { $gt: [currentDate, '$bookingStartDate'] },
                    { $lt: [currentDate, '$bookingEndtDate'] },
                  ],
                }, // if current date is between start and end date
                then: 'Ongoing',
                else: 'Complete', // if current date is after booking end date
              },
            },
          },
        },
      },
    },
    {
      $match: {
        ...(status ? { status: { $regex: status, $options: 'i' } } : {}),
      },
    },
    { $sort: { createdAt: -1 } },
    // Step 3: Add the status field based on bookingStartDate and bookingEndtDate

    { $skip: skip },
    { $limit: limit },
  ];

  const totalCount = await ParkingBooking.aggregate([
    ...aggregationPipeline.slice(0, 7), // Keep the first 6 stages for counting
    { $count: 'total' },
  ]);

  console.log({ totalCount });

  const total = totalCount.length > 0 ? totalCount[0].total : 0;
  const totalPage = Math.ceil(total / limit);

  const result = await ParkingBooking.aggregate(aggregationPipeline);

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

const getBookingDetailsService = async (bookingId: string) => {
  // console.log({ fieldId });
  const ressult = await ParkingBooking.findOne({
    _id: new mongoose.Types.ObjectId(bookingId),
  }).populate('userId parkingId');

  return ressult;
};

const getTodayEntryOrExitService = async (
  userId: string,
  role: string,
  query: Record<string, unknown>,
) => {
  const type = query.type as string;
  const today = new Date(); // Get today's date
  today.setHours(0, 0, 0, 0);

  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = query.limit ? parseInt(query.limit as string, 10) : 10;

  const skip = (page - 1) * limit;

  console.log({ userId });

  const filter: any = {};

  if (type === 'entry') {
    // Filtering for today's entry based on bookingStartDate
    filter['bookingStartDate'] = {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Matches entries that start today
    };
  } else if (type === 'exit') {
    // Filtering for today's exit based on bookingEndtDate
    filter['bookingEndtDate'] = {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Matches exits that happen today
    };
  } else {
    // Handle invalid type
    throw new Error('Invalid type. Expected "entry" or "exit".');
  }

  const aggregationPipeline: any = [
    // Step 1: Lookup the userId to populate the user details
    {
      $lookup: {
        from: 'users', // Collection name for the User model
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true, // Optional: preserve bookings without users
      },
    },

    // Step 2: Lookup the parkingId to match the ownerId
    {
      $lookup: {
        from: 'parkings', // Collection name for Parking model
        localField: 'parkingId',
        foreignField: '_id',
        as: 'parking',
      },
    },
    {
      $unwind: {
        path: '$parking',
        preserveNullAndEmptyArrays: true, // Optional: preserve bookings without parking
      },
    },

    {
      $match: {
        'parking.ownerId': new mongoose.Types.ObjectId(userId),
        ...filter,
      },
    },

    { $sort: { createdAt: -1 } },

    { $skip: skip },
    { $limit: limit },
  ];

  const totalCount = await ParkingBooking.aggregate([
    ...aggregationPipeline.slice(0, 7), // Keep the first 6 stages for counting
    { $count: 'total' },
  ]);

  console.log({ totalCount });

  const total = totalCount.length > 0 ? totalCount[0].total : 0;
  const totalPage = Math.ceil(total / limit);

  const result = await ParkingBooking.aggregate(aggregationPipeline);

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

export const parkingBookingService = {
  createParkingBookingWebHookService,
  addParkingBookingService,
  getBookingService,
  getBookingDetailsService,
  getTodayEntryOrExitService,
};
