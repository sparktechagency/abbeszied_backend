import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { contactUsService } from './contactUs.service';

const createContactUs = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await contactUsService.createContactUsService(
    req.body,
    userId,
  );

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact added successfully!',
    data: result,
  });
});

const getAllContactUs = catchAsync(async (req, res) => {
  const result = await contactUsService.getAllContactUsService(req.query);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact list get successfully!',
    data: result,
  });
});

export const contactUsController = {
  createContactUs,
  getAllContactUs,
};
