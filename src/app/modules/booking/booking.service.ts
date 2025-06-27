import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { Types } from 'mongoose';
import { Session } from '../session/session.models';
import {
  BookingStatus,
  ICreateBookingPayload,
  IRescheduleBookingPayload,
  PaymentStatus,
  SessionStatus,
} from './booking.interface';
import { Booking } from './booking.models';
import stripe from '../../config/stripe.config';
import QueryBuilder from '../../builder/QueryBuilder';
import { sendNotifications } from '../../helpers/sendNotification';

// Helper function to convert 24-hour format to 12-hour format
const convertTo12Hour = (time24h: string): string => {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// // Helper function to get package session count
// const getPackageSessionCount = (packageType: SessionPackage): number => {
//   const packageCounts = {
//     [SessionPackage.SINGLE]: 1,
//     [SessionPackage.PACKAGE_4]: 4,
//     [SessionPackage.PACKAGE_8]: 8,
//     [SessionPackage.PACKAGE_12]: 12
//   };
//   return packageCounts[packageType] || 1;
// };

// Create payment intent and temporary booking
const createPaymentIntent = async (
  payload: ICreateBookingPayload & { userId: string },
) => {
  // Validate session exists
  const session = await Session.findById(payload.sessionId);
  if (!session) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }

  // Validate coach exists
  const coach = await User.findById(payload.coachId);
  if (!coach) {
    throw new AppError(httpStatus.NOT_FOUND, 'Coach not found');
  }

  // Validate user exists
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Convert time to 24-hour format if needed
  // let startTime24h = payload.startTime;
  // if (
  //   payload.startTime.toLowerCase().includes('am') ||
  //   payload.startTime.toLowerCase().includes('pm')
  // ) {
  //   startTime24h = convertTo24Hour(payload.startTime);
  // }

  // Check if time slot is available
  const isSlotAvailable = await Session.findOne({
    _id: payload.sessionId,
    coachId: new Types.ObjectId(payload.coachId),
    'dailySessions.selectedDay': new Date(payload.selectedDay),
    'dailySessions.timeSlots.startTime12h': payload.startTime,
    'dailySessions.timeSlots.isBooked': false,
  });
  if (!isSlotAvailable) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Time slot not available or already booked',
    );
  }

  // Check if there's already a pending booking for this slot
  const existingBooking = await Booking.findOne({
    coachId: new Types.ObjectId(payload.coachId),
    selectedDay: new Date(payload.selectedDay),
    startTime: payload.startTime,
    bookingStatus: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
  });

  if (existingBooking) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Time slot already has a pending or confirmed booking',
    );
  }

  // Create temporary booking
  const booking = await Booking.create({
    sessionId: payload.sessionId,
    coachId: payload.coachId,
    userId: payload.userId,
    selectedDay: new Date(payload.selectedDay),
    startTime: payload.startTime,
    endTime: payload.endTime,
    price: payload.price,
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
  });

  // Create Stripe Checkout Session
  // Wrap your Stripe session creation with better error handling
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Coaching Session with ${coach.fullName}`,
            },
            unit_amount: Math.round(payload.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
      success_url: `${process.env.STRIPE_SUCCESS_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.STRIPE_CANCLE_URL}/booking-cancelled`,
      metadata: {
        bookingId: booking._id!.toString(),
        userId: payload.userId,
        coachId: payload.coachId,
        sessionId: payload.sessionId,
        selectedDay: payload.selectedDay,
        startTime: payload.startTime,
      },
    });

    // Update booking with checkout session ID
    await Booking.findByIdAndUpdate(booking._id, {
      checkoutSessionId: session.id,
    });

    return {
      booking,
      checkoutUrl: session.url,
      checkoutSessionId: session.id,
    };
  } catch (stripeError: any) {
    // Log the actual Stripe error
    console.error('Stripe Error Details:', {
      type: stripeError.type,
      code: stripeError.code,
      message: stripeError.message,
      param: stripeError.param,
      statusCode: stripeError.statusCode,
    });

    // Clean up temporary booking
    await Booking.findByIdAndDelete(booking._id);

    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Stripe Error: ${stripeError.message || 'Failed to create checkout session'}`,
    );
  }
};

// Reschedule booking
const rescheduleBooking = async (
  bookingId: string,
  userId: string,
  payload: IRescheduleBookingPayload,
) => {
  const { newSelectedDay, newStartTime, newEndTime, reason } = payload;

  // Find the existing booking
  const existingBooking = await Booking.findOne({
    _id: bookingId,
    userId: new Types.ObjectId(userId),
  });

  if (!existingBooking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  // Check if booking can be rescheduled
  if (existingBooking.bookingStatus === BookingStatus.CANCELLED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot reschedule cancelled booking',
    );
  }

  if (existingBooking.bookingStatus === BookingStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot reschedule completed booking',
    );
  }

  if (existingBooking.paymentStatus !== PaymentStatus.PAID) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot reschedule unpaid booking',
    );
  }

  // Check if current booking is within 24 hours (no reschedule allowed)
  const currentBookingDateTime = new Date(existingBooking.selectedDay);
  const [currentHours, currentMinutes] = existingBooking.startTime.split(':');
  currentBookingDateTime.setHours(
    parseInt(currentHours),
    parseInt(currentMinutes),
  );

  const now = new Date();
  const timeDifferenceFromCurrent =
    currentBookingDateTime.getTime() - now.getTime();
  const hoursUntilCurrentBooking = timeDifferenceFromCurrent / (1000 * 60 * 60);

  if (hoursUntilCurrentBooking < 24 && hoursUntilCurrentBooking > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot reschedule booking within 24 hours of scheduled time',
    );
  }

  // Check if new booking time is at least 24 hours from now
  const newBookingDateTime = new Date(newSelectedDay);
  const [newHours, newMinutes] = newStartTime.split(':');
  newBookingDateTime.setHours(parseInt(newHours), parseInt(newMinutes));

  const timeDifferenceToNew = newBookingDateTime.getTime() - now.getTime();
  const hoursUntilNewBooking = timeDifferenceToNew / (1000 * 60 * 60);

  if (hoursUntilNewBooking < 24) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New booking time must be at least 24 hours from now',
    );
  }

  // Validate that the new time slot is available
  const isNewSlotAvailable = await Session.findOne({
    _id: existingBooking.sessionId,
    coachId: existingBooking.coachId,
    'dailySessions.selectedDay': new Date(newSelectedDay),
    'dailySessions.timeSlots.startTime12h': newStartTime,
    'dailySessions.timeSlots.isBooked': false,
  });

  if (!isNewSlotAvailable) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New time slot is not available or already booked',
    );
  }

  // Check if there's already a booking for the new slot
  const conflictingBooking = await Booking.findOne({
    coachId: existingBooking.coachId,
    selectedDay: new Date(newSelectedDay),
    startTime: newStartTime,
    bookingStatus: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    _id: { $ne: bookingId }, // Exclude current booking
  });

  if (conflictingBooking) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New time slot already has a booking',
    );
  }

  // Start transaction to ensure atomicity
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    // Free up the old time slot
    await Session.findOneAndUpdate(
      {
        _id: existingBooking.sessionId,
        'dailySessions.selectedDay': existingBooking.selectedDay,
        'dailySessions.timeSlots.startTime12h': existingBooking.startTime,
      },
      {
        $set: {
          'dailySessions.$[session].timeSlots.$[slot].isBooked': false,
        },
        $unset: {
          'dailySessions.$[session].timeSlots.$[slot].clientId': '',
        },
      },
      {
        arrayFilters: [
          { 'session.selectedDay': existingBooking.selectedDay },
          { 'slot.startTime12h': existingBooking.startTime },
        ],
        session,
      },
    );

    // Book the new time slot
    await Session.findOneAndUpdate(
      {
        _id: existingBooking.sessionId,
        'dailySessions.selectedDay': new Date(newSelectedDay),
        'dailySessions.timeSlots.startTime12h': newStartTime,
      },
      {
        $set: {
          'dailySessions.$[session].timeSlots.$[slot].isBooked': true,
          'dailySessions.$[session].timeSlots.$[slot].clientId': userId,
        },
      },
      {
        arrayFilters: [
          { 'session.selectedDay': new Date(newSelectedDay) },
          { 'slot.startTime12h': newStartTime },
        ],
        session,
      },
    );

    // Update the booking with new details
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        selectedDay: new Date(newSelectedDay),
        startTime: newStartTime,
        endTime: newEndTime,
        rescheduleReason: reason,
        isRescheduled: true,
        rescheduleCount: (existingBooking.rescheduleCount || 0) + 1,
        lastRescheduledAt: new Date(),
      },
      { new: true, session },
    );
    const client = await User.findById(existingBooking.userId);
    await sendNotifications({
      receiver: existingBooking.coachId,
      type: 'RESCHEDULED',
      message: `Your client ${client?.fullName} has rescheduled the session`,
    });
    await session.commitTransaction();

    return {
      ...updatedBooking?.toObject(),
      startTime12h: convertTo12Hour(updatedBooking?.startTime || ''),
      endTime12h: convertTo12Hour(updatedBooking?.endTime || ''),
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
// Get user bookings
const getUserBookings = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const filter: any = { userId: new Types.ObjectId(userId) };

  const queryBuilder = new QueryBuilder(
    Booking.find(filter)
      .populate('coachId', 'fullName email image')
      .populate('sessionId', 'language pricePerSession')
      .select(
        'coachId selectedDay startTime endTime sessionStatus sessionId paymentStatus bookingStatus',
      ),
    query,
  );

  const bookings = await queryBuilder
    .fields()
    .filter()
    .paginate()
    .sort()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  // Convert times to 12-hour format for display
  const bookingsWithFormattedTime = bookings.map((booking) => ({
    ...booking.toObject(),
    startTime12h: convertTo12Hour(booking.startTime),
    endTime12h: convertTo12Hour(booking.endTime),
  }));

  return {
    bookings: bookingsWithFormattedTime,
    meta,
  };
};

// Get coach bookings
const getCoachBookings = async (
  coachId: string,
  query: Record<string, unknown>,
) => {
  const filter: any = { coachId: new Types.ObjectId(coachId) };

  const queryBuilder = new QueryBuilder(
    Booking.find(filter)
      .populate('userId', 'fullName email image')
      .populate('sessionId', 'language pricePerSession'),
    query,
  );

  const bookings = await queryBuilder
    .fields()
    .filter()
    .paginate()
    .sort()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  // Convert times to 12-hour format for display
  const bookingsWithFormattedTime = bookings.map((booking) => ({
    ...booking.toObject(),
    startTime12h: convertTo12Hour(booking.startTime),
    endTime12h: convertTo12Hour(booking.endTime),
  }));

  return {
    bookings: bookingsWithFormattedTime,
    meta,
  };
};

// Get single booking
const getBookingById = async (
  bookingId: string,
  userId: string,
  userRole: string,
) => {
  const filter: any = { _id: bookingId };

  // Add role-based filtering
  if (userRole === 'CLIENT') {
    filter.userId = new Types.ObjectId(userId);
  } else if (userRole === 'COACH') {
    filter.coachId = new Types.ObjectId(userId);
  }

  const booking = await Booking.findOne(filter)
    .populate('coachId', 'name email profileImage')
    .populate('userId', 'name email profileImage')
    .populate('sessionId', 'language pricePerSession');

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  return {
    ...booking.toObject(),
    startTime12h: convertTo12Hour(booking.startTime),
    endTime12h: convertTo12Hour(booking.endTime),
  };
};

// Cancel booking
const cancelBooking = async (
  bookingId: string,
  userId: string,
  reason?: string,
) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    userId: new Types.ObjectId(userId),
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  if (booking.bookingStatus === BookingStatus.CANCELLED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Booking already cancelled');
  }

  if (booking.bookingStatus === BookingStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot cancel completed booking',
    );
  }

  // Check if booking is within 24 hours
  const bookingDateTime = new Date(booking.selectedDay);
  const [hours, minutes] = booking.startTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes));

  const now = new Date();
  const timeDifference = bookingDateTime.getTime() - now.getTime();
  const hoursUntilBooking = timeDifference / (1000 * 60 * 60);

  if (hoursUntilBooking < 24) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot cancel booking within 24 hours of scheduled time',
    );
  }

  // Update booking status
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      bookingStatus: BookingStatus.CANCELLED,
      cancellationReason: reason,
    },
    { new: true },
  );

  // Free up the time slot
  await Session.findOneAndUpdate(
    {
      _id: booking.sessionId,
      'dailySessions.selectedDay': booking.selectedDay,
      'dailySessions.timeSlots.startTime': booking.startTime,
    },
    {
      $set: {
        'dailySessions.$[session].timeSlots.$[slot].isBooked': false,
      },
      $unset: {
        'dailySessions.$[session].timeSlots.$[slot].clientId': '',
      },
    },
    {
      arrayFilters: [
        { 'session.selectedDay': booking.selectedDay },
        { 'slot.startTime': booking.startTime },
      ],
    },
  );

  // Process refund if payment was made
  if (booking.paymentStatus === PaymentStatus.PAID && booking.paymentIntentId) {
    try {
      await stripe.refunds.create({
        payment_intent: booking.paymentIntentId,
        reason: 'requested_by_customer',
      });

      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: PaymentStatus.REFUNDED,
        bookingStatus: BookingStatus.CANCELLED,
      });
    } catch (error) {
      console.error('Refund failed:', error);
      // Don't throw error as booking is already cancelled
    }
  }

  return updatedBooking;
};

// Complete booking (for coaches)
const completeBooking = async (bookingId: string, coachId: string) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    coachId: new Types.ObjectId(coachId),
    bookingStatus: BookingStatus.CONFIRMED,
  });

  if (!booking) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Booking not found or not confirmed',
    );
  }

  // Check if the booking time has passed
  const bookingDateTime = new Date(booking.selectedDay);
  const [hours, minutes] = booking.startTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes));

  const now = new Date();
  if (now < bookingDateTime) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot complete future booking',
    );
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { sessionStatus: SessionStatus.COMPLETED },
    { new: true },
  );
  const client = await User.findById(booking?.userId);
  await sendNotifications({
    receiver: booking?.userId,
    type: 'COMPLETED',
    message: `Client ${client?.fullName} has completed the session`,
  });
  // Update user experience
  await User.findByIdAndUpdate(coachId, {
    $inc: { totalSessionComplete: 1 },
  });
  return updatedBooking;
};

// Clean up expired pending bookings (run as cron job)
const cleanupExpiredBookings = async () => {
  const expiredTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

  const expiredBookings = await Booking.find({
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    createdAt: { $lt: expiredTime },
  });

  for (const booking of expiredBookings) {
    await Booking.findByIdAndDelete(booking._id);
    console.log(`Cleaned up expired booking: ${booking._id}`);
  }
};
const getAllBooking = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Booking.find({})
      .populate({
        path: 'userId',
        select: 'fullName email image',
      })
      .populate({
        path: 'sessionId',
        select: 'pricePerSession aboutMe',
      })
      .populate({
        path: 'coachId',
        select: 'fullName email image',
      }),
    query,
  );

  const result = await queryBuilder
    .fields()
    .filter()
    .paginate()
    .priceRange()
    .sort()
    .search(['orderNumber'])
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();
  return {
    meta,
    result,
  };
};
const getSingleBooking = async (bookingId: string) => {
  const result = await Booking.findById(bookingId)
    .populate({
      path: 'userId',
      select: 'fullName email image',
    })
    .populate({
      path: 'sessionId',
      select: 'pricePerSession aboutMe',
    })
    .populate({
      path: 'coachId',
      select: 'fullName email image',
    });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  return result;
};

const getDateRange = (filter: string) => {
  const today = new Date();
  let startDate: Date;

  switch (filter) {
    case 'today':
      startDate = new Date(today.setHours(0, 0, 0, 0)); // Set to midnight today
      break;
    case 'thisWeek':
      const firstDayOfWeek = today.getDate() - today.getDay(); // Get the first day of the week (Sunday)
      startDate = new Date(today.setDate(firstDayOfWeek));
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'thisMonth':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1); // First day of this month
      break;
    case 'last30Days':
      startDate = new Date(today.setDate(today.getDate() - 30)); // 30 days ago
      break;
    default:
      startDate = today; // Default to today
      break;
  }
  return startDate;
};

const getBookingAnalysis = async (dateFilter: string) => {
  // Calculate the start date based on the filter
  const startDate = getDateRange(dateFilter);

  // Extend the query to filter by date
  const dateQuery = { createdAt: { $gte: startDate } };

  const result = await Booking.aggregate([
    {
      $match: {
        ...dateQuery, // Apply the date range filter
      },
    },
    {
      $group: {
        _id: '$bookingStatus',
        totalBookings: { $sum: 1 },
        totalAmount: { $sum: '$price' },
      },
    },
  ]);
  // Define default statuses
  const defaultStatuses = [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
  ];

  // Initialize the result with default values for all statuses
  let resultMap = defaultStatuses.map((status) => ({
    _id: status,
    totalBookings: 0,
    totalAmount: 0,
  }));

  // Update the resultMap with actual data from the aggregation
  result.forEach((item) => {
    const statusIndex = resultMap.findIndex(
      (status) => status._id === item._id,
    );
    if (statusIndex !== -1) {
      resultMap[statusIndex] = item; // Replace with the actual result
    }
  });

  return resultMap;
};
export const bookingService = {
  createPaymentIntent,
  getAllBooking,
  getUserBookings,
  getCoachBookings,
  getBookingById,
  cancelBooking,
  completeBooking,
  cleanupExpiredBookings,
  rescheduleBooking,
  getSingleBooking,
  getBookingAnalysis,
};
// export const bookingService = {
//   bookTimeSlot,
//   createPaymentIntent
// };
