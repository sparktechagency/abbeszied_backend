import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { bookingService } from './booking.service';

const createPaymentIntent = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { coachId, sessionId, selectedDay, startTime, endTime, price } =
    req.body;

  const result = await bookingService.createPaymentIntent({
    coachId,
    sessionId,
    selectedDay,
    startTime,
    endTime,
    price,
    userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment intent created successfully',
    data: result,
  });
});

const getUserBookings = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await bookingService.getUserBookings(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User bookings retrieved successfully',
    data: result.bookings,
    meta: result.meta,
  });
});

const getCoachBookings = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await bookingService.getCoachBookings(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coach bookings retrieved successfully',
    data: result,
  });
});

const getBookingById = catchAsync(async (req, res) => {
  const { userId, role } = req.user;
  const { bookingId } = req.params;

  const result = await bookingService.getBookingById(bookingId, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

const cancelBooking = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { bookingId } = req.params;
  const { reason } = req.body;

  const result = await bookingService.cancelBooking(bookingId, userId, reason);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking cancelled successfully',
    data: result,
  });
});

const completeBooking = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { bookingId } = req.params;

  const result = await bookingService.completeBooking(bookingId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking completed successfully',
    data: result,
  });
});
const rescheduleBooking = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { bookingId } = req.params;
  const { newSelectedDay, newStartTime, newEndTime, reason } = req.body;

  const result = await bookingService.rescheduleBooking(bookingId, userId, {
    newSelectedDay,
    newStartTime,
    newEndTime,
    reason,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking rescheduled successfully',
    data: result,
  });
});

const getAllBooking = catchAsync(async (req, res) => {
  const result = await bookingService.getAllBooking(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All bookings retrieved successfully',
    data: result.result,
    meta: result.meta,
  });
});
const getSingleBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params;
  const result = await bookingService.getSingleBooking(bookingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});
const getBookingAnalysis = catchAsync(async (req, res) => {
  // Pass the date filter from the query parameter (e.g., today, thisWeek, etc.)
  const dateFilter = req.query.dateFilter || 'today'; // Default to today if no filter is provided
  const result = await bookingService.getBookingAnalysis(dateFilter as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking analysis retrieved successfully',
    data: result,
  });
});
export const bookingController = {
  createPaymentIntent,
  getAllBooking,
  getUserBookings,
  getCoachBookings,
  getBookingById,
  cancelBooking,
  completeBooking,
  rescheduleBooking,
  getSingleBooking,
  getBookingAnalysis
};
