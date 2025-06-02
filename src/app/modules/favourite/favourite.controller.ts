// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { favouriteService } from './favourite.service';
import httpStatus from 'http-status';

const createFavourite = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  const payload = {
    userId,
    parkingId: req.body.parkingId,
  };
  const result = await favouriteService.createFavourite(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result.data,
    message: result.message,
  });
});

const getMyFavouriteList = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await favouriteService.getMyFavouriteListService(
    userId,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get my notification.',
    data: result,
  });
});

export const favouriteController = {
  createFavourite,
  getMyFavouriteList,
};
