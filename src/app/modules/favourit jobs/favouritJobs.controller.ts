// ===== CONTROLLER =====
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FavouriteJobServices } from './favouritJobs.service';

const toggleFavouriteJob = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { jobId } = req.params;
 
  const result = await FavouriteJobServices.toggleFavouriteJob(userId, jobId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: { isFavourite: result.isFavourite },
  });
});

const getFavouriteJobs = catchAsync(async (req, res) => {
  const { userId } = req.user;
  
  const result = await FavouriteJobServices.getFavouriteJobs(userId, req.query);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Favourite jobs retrieved successfully',
    data: result.favouriteJobs,
    meta: result.meta,
  });
});

const removeFavouriteJob = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { jobId } = req.params;
  
  await FavouriteJobServices.removeFavouriteJob(userId, jobId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job removed from favourites successfully',
    data: null,
  });
});



export const FavouriteJobController = {
  toggleFavouriteJob,
  removeFavouriteJob,
  getFavouriteJobs,

};
