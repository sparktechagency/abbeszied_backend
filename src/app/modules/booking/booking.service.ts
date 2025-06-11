import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { Types } from 'mongoose';
import { Session } from '../session/session.models';
import {
  BookingStatus,
  ICreateBookingPayload,
  PaymentStatus,
} from './booking.interface';
import { Booking } from './booking.models';
import stripe from '../../config/stripe.config';

// Helper function to convert 12-hour format to 24-hour format
const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM' || modifier === 'pm') {
    hours = (parseInt(hours, 10) + 12).toString();
  }

  return `${hours.padStart(2, '0')}:${minutes}`;
};

// Helper function to convert 24-hour format to 12-hour format
const convertTo12Hour = (time24h: string): string => {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Helper function to get dates for next months based on day names
const getDatesByDayNames = (dayNames: string[], months: number = 2): Date[] => {
  const dayMapping: { [key: string]: number } = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  };

  const dates: Date[] = [];
  const today = new Date();
  const endDate = new Date();
  endDate.setMonth(today.getMonth() + months);

  // Convert day names to numbers
  const targetDays = dayNames
    .map((day) => dayMapping[day.toLowerCase()])
    .filter((day) => day !== undefined);

  // Generate dates for the next specified months
  for (
    let date = new Date(today);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    if (targetDays.includes(date.getDay())) {
      dates.push(new Date(date));
    }
  }

  return dates;
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

// Book a time slot
const bookTimeSlot = async (payload: {
  coachId: string;
  selectedDay: Date;
  startTime: string;
  clientId: string;
}) => {
  const session = await Session.findOne({
    coachId: new Types.ObjectId(payload.coachId),
  });

  if (!session) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }

  // Convert time to 24-hour format if needed
  let startTime24h = payload.startTime;
  if (
    payload.startTime.includes('AM') ||
    payload.startTime.includes('PM') ||
    payload.startTime.includes('am') ||
    payload.startTime.includes('pm')
  ) {
    startTime24h = convertTo24Hour(payload.startTime);
  }

  const result = await Session.findOneAndUpdate(
    {
      coachId: new Types.ObjectId(payload.coachId),
      'dailySessions.selectedDay': payload.selectedDay,
      'dailySessions.timeSlots.startTime': startTime24h,
      'dailySessions.timeSlots.isBooked': false,
    },
    {
      $set: {
        'dailySessions.$[session].timeSlots.$[slot].isBooked': true,
        'dailySessions.$[session].timeSlots.$[slot].clientId':
          new Types.ObjectId(payload.clientId),
      },
      $inc: { bookedSessions: 1 },
    },
    {
      arrayFilters: [
        { 'session.selectedDay': payload.selectedDay },
        { 'slot.startTime': startTime24h, 'slot.isBooked': false },
      ],
      new: true,
    },
  );
  console.log('booking data', result);
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Time slot not available or already booked',
    );
  }

  return result;
};
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
// Get user bookings
const getUserBookings = async (userId: string, query: any) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter: any = { userId: new Types.ObjectId(userId) };
  if (status) {
    filter.bookingStatus = status;
  }

  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const bookings = await Booking.find(filter)
    .populate('coachId', 'name email profileImage')
    .populate('sessionId', 'language pricePerSession')
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Booking.countDocuments(filter);

  // Convert times to 12-hour format for display
  const bookingsWithFormattedTime = bookings.map((booking) => ({
    ...booking.toObject(),
    startTime12h: convertTo12Hour(booking.startTime),
    endTime12h: convertTo12Hour(booking.endTime),
  }));

  return {
    bookings: bookingsWithFormattedTime,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get coach bookings
const getCoachBookings = async (coachId: string, query: any) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter: any = { coachId: new Types.ObjectId(coachId) };
  if (status) {
    filter.bookingStatus = status;
  }

  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const bookings = await Booking.find(filter)
    .populate('userId', 'name email profileImage')
    .populate('sessionId', 'language pricePerSession')
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Booking.countDocuments(filter);

  // Convert times to 12-hour format for display
  const bookingsWithFormattedTime = bookings.map((booking) => ({
    ...booking.toObject(),
    startTime12h: convertTo12Hour(booking.startTime),
    endTime12h: convertTo12Hour(booking.endTime),
  }));

  return {
    bookings: bookingsWithFormattedTime,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
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
    { bookingStatus: BookingStatus.COMPLETED },
    { new: true },
  );

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

export const bookingService = {
  createPaymentIntent,
  getUserBookings,
  getCoachBookings,
  getBookingById,
  cancelBooking,
  completeBooking,
  cleanupExpiredBookings,
};
// export const bookingService = {
//   bookTimeSlot,
//   createPaymentIntent
// };
