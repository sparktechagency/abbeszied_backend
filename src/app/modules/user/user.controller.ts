import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { userService } from './user.service';
import sendResponse from '../../utils/sendResponse';
import { updateFileName } from '../../utils/fileHelper';

import httpStatus from 'http-status';
import { FilesObject } from '../../interface/common.interface';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { body, files } = req as Request & { files: FilesObject };

  const cerificates = files.cerificates?.map((photo) =>
    updateFileName('profile', photo.filename),
  );

  body.cerificates = cerificates;

  if (!body.role) {
    body.role = 'client';
  }
  const data = await userService.createUserToken(body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Create ${body.role} account successfully.`,
    data,
  });
});

const userCreateVarification = catchAsync(async (req, res) => {
  const token = req.headers?.token as string;
  const { otp } = req.body;

  // console.log({ otp, token });
  const newUser = await userService.otpVerifyAndCreateUser({ otp, token });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User create successfully',
    data: newUser,
  });
});

// rest >...............

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUserQuery(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Users All are requered successful!!',
  });
});

const getAllUserCount = catchAsync(async (req, res) => {
  const result = await userService.getAllUserCount();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'All  users count successful!!',
  });
});

const getAllUserRasio = catchAsync(async (req, res) => {
  const yearQuery = req.query.year;

  // Safely extract year as string
  const year = typeof yearQuery === 'string' ? parseInt(yearQuery) : undefined;

  if (!year || isNaN(year)) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Invalid year provided!',
      data: {},
    });
  }

  const result = await userService.getAllUserRatio(year);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Users All Ratio successful!!',
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  console.log('Files received:', req.files);
  console.log('Body before:', req.body);

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Handle image upload
  if (files?.image?.[0]) {
    req.body.image = updateFileName('profile', files.image[0].filename);
    console.log('Image processed:', req.body.image);
  }

  // Handle introVideo upload
  if (files?.introVideo?.[0]) {
    req.body.introVideo = updateFileName(
      'profile',
      files.introVideo[0].filename,
    );
    console.log('IntroVideo processed:', req.body.introVideo);
  }

  console.log('Body after:', req.body);

  const result = await userService.updateUser(req?.user?.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile updated successfully',
    data: result,
  });
});
const updateOwnerStatus = catchAsync(async (req: Request, res: Response) => {
  const { businessId } = req?.params;

  const result = await userService.updateOwnerStatusService(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile updated successfully',
    data: result,
  });
});

const blockedUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.blockedUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Blocked successfully',
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteMyAccount(req.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const userController = {
  createUser,
  userCreateVarification,
  getUserById,
  getMyProfile,
  getAllUsers,
  getAllUserCount,
  getAllUserRasio,
  updateMyProfile,
  updateOwnerStatus,
  blockedUser,
  deleteMyAccount,
};
