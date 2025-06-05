import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { sessionService } from './session.service';

const createSession = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await sessionService.createSession({
    ...req.body,
    userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Session created successfully',
    data: result,
  });
});

const updateSession = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await sessionService.updateSession(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Session updated successfully',
    data: result,
  });
});

const deleteSession = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user;
  const result = await sessionService.deleteSession(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Session deleted successfully',
    data: result,
  });
});

const getUserSessions = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await sessionService.getUserSessions(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sessions retrieved successfully',
    data: result,
  });
});

const getSessionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await sessionService.getSessionById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Session retrieved successfully',
    data: result,
  });
});

const getAllSessions = catchAsync(async (req: Request, res: Response) => {
  const result = await sessionService.getAllSessions();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All sessions retrieved successfully',
    data: result,
  });
});

const getAvailableTimeSlots = catchAsync(async (req: Request, res: Response) => {
  const { coachId, selectedDay } = req.query;

  if (!coachId || !selectedDay) {
    throw new Error('Coach ID and selected day are required');
  }

  const result = await sessionService.getAvailableTimeSlots(
    coachId as string,
    new Date(selectedDay as string)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Available time slots retrieved successfully',
    data: result,
  });
});

export const sessionController = {
  createSession,
  updateSession,
  deleteSession,
  getUserSessions,
  getSessionById,
  getAllSessions,
  getAvailableTimeSlots
};