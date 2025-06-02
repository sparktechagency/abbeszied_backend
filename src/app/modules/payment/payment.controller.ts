import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

// Create Field
const createPayment = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  req.body.customerId = userId;

  const result = await paymentService.createPaymentService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Court booking successfully',
    data: result,
  });
});

const getPaymentByCustomer = catchAsync(async (req, res) => {
  const { userId, role }: any = req.user;

  const { meta, result } = await paymentService.getAllPaymentByUserId(
    userId,
    role,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All payment get successful!!',
  });
});
const getAllPaymentByOwnerId = catchAsync(async (req, res) => {
  const { userId }: any = req.user;
  // console.log({ userId });
  const result = await paymentService.getAllPaymentByOwnerIdService(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: ' All payment get successful!!',
  });
});

const getLast12MonthsEarnings = catchAsync(async (req, res) => {
  const { userId, role }: any = req.user;
  // console.log({ userId });
  const result = await paymentService.getLast12MonthsEarningsService(
    userId,
    role,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Last 12MonthsEarnings get successful!!',
  });
});

const successPage = catchAsync(async (req, res) => {
  // console.log('hit hoise');
  res.render('success.ejs');
});

const cancelPage = catchAsync(async (req, res) => {
  res.render('cancel.ejs');
});

export const paymenController = {
  createPayment,
  getPaymentByCustomer,
  getAllPaymentByOwnerId,
  getLast12MonthsEarnings,
  successPage,
  cancelPage,
};
