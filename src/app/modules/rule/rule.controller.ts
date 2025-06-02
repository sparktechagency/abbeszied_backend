import catchAsync from '../../utils/catchAsync';
import { ruleServices } from './rule.service';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

const createRuleRule = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  req.body.ownerId = userId;
  const ressult = await ruleServices.createRuleService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rule added successfully',
    data: ressult,
  });
});

const getAllRuleByOwnerId = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await ruleServices.getAllRuleByOwnerIdService(
    userId,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All rule get successfully!',

    data: result,
  });
});

const updateRule = catchAsync(async (req, res) => {
  const { ruleId } = req.params;
  const { userId } = req.user;

  const payload = {
    text: req.body?.text,
  };

  const result = await ruleServices.updateRuleService(ruleId, userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rule update successfully!',
    data: result,
  });
});

const switchRuleStatus = catchAsync(async (req, res) => {
  const { ruleId } = req.params;
  const { userId } = req.user;

  const payload = {
    status: true,
  };

  const result = await ruleServices.updateRuleService(ruleId, userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rule update successfully!',
    data: result,
  });
});

const deleteRule = catchAsync(async (req, res) => {
  const { ruleId } = req.params;
  const { userId } = req.user;

  // console.log({ userId });
  // console.log({ ruleId });

  const result = await ruleServices.deleteRuleService(ruleId, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rule delete successfully!',
    data: result,
  });
});

export const ruleControllers = {
  createRuleRule,
  getAllRuleByOwnerId,
  updateRule,
  switchRuleStatus,
  deleteRule,
};
