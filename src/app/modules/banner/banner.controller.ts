import { Request, Response } from 'express';
import { BannerService } from './banner.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { FilesObject } from '../../interface/common.interface';
import { updateFileName } from '../../utils/fileHelper';

const createBanner = catchAsync(async (req, res) => {
  const { body } = req as Request & { files: FilesObject };
  if (req?.file) {
    req.body.image = updateFileName('banners', req?.file?.filename);
  }
  const result = await BannerService.createBannerToDB(body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banner created successfully',
    data: result,
  });
});

const getAllBanner = catchAsync(async (req, res) => {
  const result = await BannerService.getAllBannerFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banner retrieved successfully',
    data: result.result,
    meta: result.meta,
  });
});
const getClientBanner = catchAsync(async (req, res) => {
  const clientResult = await BannerService.getClientAllBannerFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banner retrieved successfully',
    data: clientResult,
  });
});
const getCorporateBanner = catchAsync(async (req, res) => {
  const corporateResult = await BannerService.getCorporateAllBannerFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banner retrieved successfully',
    data: corporateResult,
  });
});
const getCoachBanner = catchAsync(async (req, res) => {
  const coachResult = await BannerService.getCoachAllBannerFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banner retrieved successfully',
    data: coachResult,
  });
});

const updateBanner = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (req?.file) {
    req.body.image = updateFileName('banners', req?.file?.filename);
  }

  const result = await BannerService.updateBannerToDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banner updated successfully',
    data: result,
  });
});

const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await BannerService.deleteBannerToDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banner deleted successfully',
    data: result,
  });
});

export const BannerController = {
  createBanner,
  getAllBanner,
  getClientBanner,
  getCorporateBanner,
  getCoachBanner,
  updateBanner,
  deleteBanner,
};
