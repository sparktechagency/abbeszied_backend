import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';

const createReview = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { rating, ...otherFields } = req.body;

  const reviewPayload = {
    ...otherFields,
    clientId: userId,
    rating: Number(rating),
  };

  const result = await ReviewService.createReviewToDB(reviewPayload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review Created Successfully',
    data: result,
  });
});
const removeReview = catchAsync(async (req, res) => {
  const result = await ReviewService.deleteReviewToDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted Successfully',
    data: result,
  });
});
const getAllReview = catchAsync(async (req, res) => {
  const query = req.query;
  const { userId } = req.user;
  const result = await ReviewService.getReviews(userId, query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review retrieved Successfully',
    data: result.review,
    meta: result.meta,
  });
});
const getAnalysis = catchAsync(async (req, res) => {
  const result = await ReviewService.getReviewAnalysis();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review analysis retrieved Successfully',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  removeReview,
  getAnalysis,
  getAllReview,
};
