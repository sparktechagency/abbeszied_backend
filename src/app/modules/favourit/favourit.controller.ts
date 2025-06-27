// ===== CONTROLLER =====
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FavouriteCoachServices } from './favourit.service';

const toggleFavouriteCoach = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { sessionId } = req.params;
 
  const result = await FavouriteCoachServices.toggleFavouriteCoach(userId, sessionId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: { isFavourite: result.isFavourite },
  });
});

const getFavouriteCoaches = catchAsync(async (req, res) => {
  const { userId } = req.user;
  
  const result = await FavouriteCoachServices.getFavouriteCoaches(userId, req.query);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Favourite coaches retrieved successfully',
    data: result.favouriteCoaches,
    meta: result.meta,
  });
});

const removeFavouriteCoach = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { sessionId } = req.params;
  
  await FavouriteCoachServices.removeFavouriteCoach(userId, sessionId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coach removed from favourites successfully',
    data: null,
  });
});



export const FavouriteCoachController = {
  toggleFavouriteCoach,
  removeFavouriteCoach,
  getFavouriteCoaches,

};
