import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import { parkingService } from './parking.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { updateFileName } from '../../utils/fileHelper';
import { string } from 'zod';

interface File {
  path: string;
  filename: string;
  [key: string]: any;
}

interface FilesObject {
  images?: File[];
  [key: string]: File[] | undefined;
}

// Create Field
const createParking = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { body, files } = req as Request & { files: FilesObject };
  console.log({ userId });
  const parkingImages = files.images?.map((photo) =>
    updateFileName('parking', photo.filename),
  );

  body.ownerId = userId;
  body.images = parkingImages;

  const result = await parkingService.createParkingService(body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parking spot created successfully.',
    data: result,
  });
});

const getAllParking = catchAsync(async (req, res) => {
  console.log({ object: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' });
  const result = await parkingService.getAllParkingService(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All court get successfully!',

    data: result,
  });
});

const getAllParkingByLocation = catchAsync(async (req, res) => {
  const result = await parkingService.getAllParkingByLocationService(
    req.user?.userId,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All court get successfully!',

    data: result,
  });
});

const getAllBusinessParking = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await parkingService.getAllBusinessParkingService(
    userId,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get all parking successfully for business!',
    data: result,
  });
});

const getParkingDetailsforBusinessAndAdmin = catchAsync(async (req, res) => {
  const { parkingId } = req.params;

  const result =
    await parkingService.getParkingDetailsforBusinessAndAdminService(parkingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get  parking details successfully!',
    data: result,
  });
});

const getParkingDetailsByParkingIdAndLocation = catchAsync(async (req, res) => {
  const { parkingId } = req.params;
  const { userId } = req.user;

  const result =
    await parkingService.getParkingDetailsByParkingIdAndLocationService(
      userId,
      parkingId,
      req.query,
    );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get  parking details successfully!',
    data: result,
  });
});

const getBookingsForNext30Days = catchAsync(async (req, res) => {
  const { parkingId } = req.params;
  const date: any = req.query?.date;

  const result = await parkingService.getBookingsForNext30Days(parkingId, date);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Available date get successfully!',

    data: result,
  });
});

const updateParking = catchAsync(async (req, res) => {
  const { parkingId } = req.params;
  const { userId } = req.user;
  const { body, files } = req as Request & { files: FilesObject };

  if (files?.images) {
    const parkingImages = files.images?.map((photo) =>
      updateFileName('parking', photo.filename),
    );

    body.images = parkingImages;
  }

  body.ownerId = userId;

  const result = await parkingService.updateParkingService(
    parkingId,
    userId,
    body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Update single parking spot successfully!',

    data: result,
  });
});

const switchParkingStatus = catchAsync(async (req, res) => {
  const { parkingId } = req.params;
  const { userId } = req.user;
  const { revenue } = req.query;

  const result = await parkingService.switchParkingStatusService(
    userId,
    parkingId,
    revenue as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Update  parking spot status successfully!',

    data: result,
  });
});

const deleteParking = catchAsync(async (req, res) => {
  const { parkingId } = req.params;
  const { userId } = req.user;

  const result = await parkingService.deleteParkingService(parkingId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parking spot delete successfully!',
    data: result,
  });
});

export const parkingController = {
  createParking,
  getAllParking,
  getAllParkingByLocation,
  getAllBusinessParking,
  getParkingDetailsforBusinessAndAdmin,
  getParkingDetailsByParkingIdAndLocation,
  getBookingsForNext30Days,
  updateParking,
  switchParkingStatus,
  deleteParking,
};
