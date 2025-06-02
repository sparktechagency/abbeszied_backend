import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import { parkingBookingService } from './booking.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

// Create Field
const createParkingBookingWebHook = catchAsync(
  async (req: Request, res: Response) => {
    const { userId }: any = req.user;

    req.body.userId = userId;
    const result =
      await parkingBookingService.createParkingBookingWebHookService(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Court booking starting...',
      data: result,
    });
  },
);

const getAllBookingByOwnerId = catchAsync(async (req, res) => {
  const { userId, role }: any = req.user;

  const result = await parkingBookingService.getBookingService(
    userId,
    role,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'All parking booking get successful!!',
  });
});

const getBookingDetails = catchAsync(async (req, res) => {
  const { bookingId }: any = req.params;
  console.log(req.user);
  const result =
    await parkingBookingService.getBookingDetailsService(bookingId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'All parking booking get successful!!',
  });
});

const getTodayEntryOrExit = catchAsync(async (req, res) => {
  const { userId, role }: any = req.user;
  const result = await parkingBookingService.getTodayEntryOrExitService(
    userId,
    role,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Booking get successful!!',
  });
});

export const parkingBookingController = {
  createParkingBookingWebHook,
  getAllBookingByOwnerId,
  getBookingDetails,
  getTodayEntryOrExit,
};
