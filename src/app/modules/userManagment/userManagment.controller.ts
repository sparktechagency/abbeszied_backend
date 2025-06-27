import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DashboardUserService } from './userManagment.service';

const getAllUser = catchAsync(async (req, res) => {
  const result = await DashboardUserService.allUser(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result.users,
    meta: result.meta,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await DashboardUserService.singleUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successful',
    data: result,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const result = await DashboardUserService.updateUserStatus(
    req.params.id,
    status,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User status update successfully',
    data: result,
  });
});


export const DashboardUserController = {
  getAllUser,
  getSingleUser,
  updateStatus
};
