import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { DashboardService } from './dashboard.service';
import AppError from '../../error/AppError';

const getDashboardInfo = catchAsync(async (req, res) => {
  const year = req.query.year
    ? Number(req.query.year)
    : new Date().getFullYear();
  if (!year || isNaN(Number(year))) {
    throw new AppError(400, 'Year must be a valid number');
  }

  const role = req.query.role ? String(req.query.role).toLowerCase() : null;
  // Check for valid role if it is provided
  // Check for valid role if it is provided
  if (role && !['coach', 'client'].includes(role)) {
    throw new AppError(400, 'Invalid role provided. Use "coach" or "client".');
  }
  const result = await DashboardService.userGraph(year, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard Info Retrieved Successfully',
    data: result,
  });
});

const getDashboardStats = catchAsync(async (req, res) => {
    // Call the service to get the dashboard statistics
    const stats = await DashboardService.getDashboardStats();
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Dashboard Stats Retrieved Successfully',
      data: stats,
    });
  });
export const DashboardController = {
  getDashboardInfo,
  getDashboardStats
};
