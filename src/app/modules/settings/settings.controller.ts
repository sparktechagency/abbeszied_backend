import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import { settingsService } from './settings.service';
import httpStatus from 'http-status';

const addSettings = catchAsync(async (req, res) => {
  const settingData = {
    privacyPolicy: '',
    aboutUs: '',
    support: '',
    termsOfService: '',
  };
  const result = await settingsService.addSettings(settingData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Setting added successfully',
    data: result,
  });
});

const getSettings = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await settingsService.getSettings(req.query.title as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Setting get successfully',
      data: result,
    });
  },
);

const getPrivacyPolicy = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const htmlContent = await settingsService.getPrivacyPolicy();
    res.sendFile(htmlContent);
  },
);

const getAccountDelete = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const htmlContent = await settingsService.getAccountDelete();
    res.sendFile(htmlContent);
  },
);

const getSupport = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const htmlContent = await settingsService.getSupport();
    res.sendFile(htmlContent);
  },
);

const updateSetting = catchAsync(async (req, res) => {
  //   const { id } = req.params;
  const settingData = { ...req.body };
  const result = await settingsService.updateSettings(settingData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Setting update successfully',
    data: result,
  });
});

export const settingsController = {
  addSettings,
  getSettings,
  getPrivacyPolicy,
  getAccountDelete,
  getSupport,
  updateSetting,
};
