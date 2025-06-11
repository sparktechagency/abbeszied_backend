import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { sessionService } from './session.service';
import AppError from '../../error/AppError';

const createSession = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await sessionService.createSession({
    ...req.body,
    coachId: userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Session created successfully',
    data: result,
  });
});

const updateSession = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { selectedDay } = req.body;

  const result = await sessionService.updateSession(
    userId,
    new Date(selectedDay),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Session updated successfully',
    data: result,
  });
});

const bookTimeSlot = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { coachId, selectedDay, startTime } = req.body;

  const result = await sessionService.bookTimeSlot({
    coachId,
    selectedDay: new Date(selectedDay),
    startTime,
    clientId: userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Time slot booked successfully',
    data: result,
  });
});

const deleteSession = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { selectedDay } = req.query;

  let result;
  if (selectedDay) {
    // Delete specific daily session
    result = await sessionService.deleteSession(
      userId,
      new Date(selectedDay as string),
    );
  } else {
    // Delete entire session document
    result = await sessionService.deleteSession(userId);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: selectedDay
      ? 'Daily session deleted successfully'
      : 'Session deleted successfully',
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
const getRecommendedCoach = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await sessionService.getRecommendedCoach(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coach retrieved successfully',
    data: result,
  });
});
const getCoach = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await sessionService.getCoach(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coach retrieved successfully',
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

const getAvailableTimeSlots = catchAsync(
  async (req: Request, res: Response) => {
    const { coachId, selectedDay } = req.query;

    if (!coachId || !selectedDay) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Coach ID and selected day are required',
      );
    }

    const result = await sessionService.getAvailableTimeSlots(
      coachId as string,
      new Date(selectedDay as string),
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Available time slots retrieved successfully',
      data: result,
    });
  },
);

export const sessionController = {
  createSession,
  updateSession,
  bookTimeSlot,
  deleteSession,
  getUserSessions,
  getAllSessions,
  getAvailableTimeSlots,
  getRecommendedCoach,
  getCoach
};
