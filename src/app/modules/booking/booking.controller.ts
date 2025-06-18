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
    message: 'User bookings fetched successfully',
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
    message: 'Coach bookings fetched successfully',
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
    message: 'Booking fetched successfully',
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
    message: 'All bookings fetched successfully',
    data: result.result,
    meta: result.meta,
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
};
