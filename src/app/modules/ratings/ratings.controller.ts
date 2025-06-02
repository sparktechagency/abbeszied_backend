import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { reviewService } from './ratings.service';

const createReview = catchAsync(async (req, res) => {
  const reviewData = req.body;
  const { userId } = req.user;
  // console.log({ userId });
  reviewData.userId = userId;

  const result = await reviewService.createReviewService(reviewData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review added successfully!',
    data: result,
  });
});

const getReviewByCustomer = catchAsync(async (req, res) => {
  const { parkingId }: any = req.params;
  const { meta, result } = await reviewService.getAllReviewByBusinessQuery(
    req.query,
    parkingId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All Review are requered successful!!',
  });
});

export const reviewController = {
  createReview,
  getReviewByCustomer,
};
