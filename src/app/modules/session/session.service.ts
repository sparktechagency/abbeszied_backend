import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { ISession } from './session.interface';
import { Session } from './session.models';
import { User } from '../../modules/user/user.models';
import { Types } from 'mongoose';

const createSession = async (payload: ISession) => {
  const user = await User.IsUserExistById(payload.userId.toString());
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Validate time slots format and calculate end time (1 hour after start)
  payload.timeSlots = payload.timeSlots.map((slot) => {
    const start = new Date(`1970-01-01T${slot.startTime}`);

    if (isNaN(start.getTime())) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid time format');
    }

    // Calculate end time (1 hour after start)
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const endTime = end.toTimeString().slice(0, 5);

    return {
      ...slot,
      endTime,
      isBooked: false,
    };
  });

  const result = await Session.create(payload);
  return result;
};

const updateSession = async (id: string, payload: Partial<ISession>) => {
  const exists = await Session.findById(id);
  if (!exists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }

  if (payload.timeSlots) {
    // Convert time to 24-hour format and calculate end time
    payload.timeSlots = payload.timeSlots.map((slot) => {
      const standardTime = slot.startTime;
      const start = new Date(`1970-01-01T${standardTime}`);

      if (isNaN(start.getTime())) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid time format');
      }

      // Calculate end time (1 hour after start)
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const endTime = end.toTimeString().slice(0, 5);

      return {
        ...slot,
        startTime: standardTime,
        endTime,
        isBooked: slot.isBooked || false,
      };
    });
  }

  const result = await Session.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteSession = async (id: string, userId: string) => {
  const exists = await Session.findOne({ _id: id, userId });
  if (!exists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }

  const result = await Session.findByIdAndDelete(id);
  return result;
};

const getUserSessions = async (userId: string) => {
  const result = await Session.find({ userId });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }
  return result;
};

const getSessionById = async (id: string) => {
  const result = await Session.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }
  return result;
};

const getAllSessions = async () => {
  const result = await Session.find().populate('userId', 'fullName email');
  return result;
};

const getAvailableTimeSlots = async (coachId: string, selectedDay: Date) => {
  // Convert the selected day to start and end of day for query
  const dayStart = new Date(selectedDay);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(selectedDay);
  dayEnd.setHours(23, 59, 59, 999);

  const sessions = await Session.find({
    userId: coachId,
    selectedDay: {
      $gte: dayStart,
      $lte: dayEnd,
    },
    isActive: true,
  });

  // Get all available time slots
  const availableTimeSlots = sessions.flatMap((session) =>
    session.timeSlots
      .filter((slot) => !slot.isBooked)
      .map((slot) => ({
        sessionId: session._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        pricePerSession: session.pricePerSession,
      })),
  );

  return availableTimeSlots;
};

const getSessionStatus = async (userId: string) => {
  const currentDate = new Date();
  const sessions = await Session.find({
    'timeSlots.bookedBy': userId,
  }).populate('userId', 'fullName email');

  const upcoming: {
    sessionId: Types.ObjectId;
    coachId: Types.ObjectId;
    startTime: string;
    endTime: string;
    selectedDay: Date;
    pricePerSession: number;
  }[] = [];
  const completed: {
    sessionId: Types.ObjectId;
    coachId: Types.ObjectId;
    startTime: string;
    endTime: string;
    selectedDay: Date;
    pricePerSession: number;
    completedAt: Date;
  }[] = [];

  sessions.forEach((session) => {
    session.timeSlots.forEach((slot) => {
      if (slot.bookedBy?.toString() === userId) {
        const sessionDateTime = new Date(session.selectedDay);
        const [hours, minutes] = slot.endTime.split(':');
        sessionDateTime.setHours(parseInt(hours), parseInt(minutes));

        const sessionInfo = {
          sessionId: session._id,
          coachId: session.userId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          selectedDay: session.selectedDay,
          pricePerSession: session.pricePerSession,
        };

        if (sessionDateTime > currentDate) {
          upcoming.push(sessionInfo);
        } else {
          completed.push({
            ...sessionInfo,
            completedAt: sessionDateTime,
          });
        }
      }
    });
  });

  return {
    upcoming: upcoming.sort(
      (a, b) => a.selectedDay.getTime() - b.selectedDay.getTime(),
    ),
    completed: completed.sort(
      (a, b) => b.completedAt.getTime() - a.completedAt.getTime(),
    ),
  };
};

const bookTimeSlot = async (
  sessionId: string,
  timeSlotStartTime: string,
  userId: string,
) => {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }

  const timeSlot = session.timeSlots.find(
    (slot) => slot.startTime === timeSlotStartTime,
  );
  if (!timeSlot) {
    throw new AppError(httpStatus.NOT_FOUND, 'Time slot not found');
  }

  if (timeSlot.isBooked) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Time slot is already booked');
  }

  timeSlot.isBooked = true;
  timeSlot.bookedBy = userId;
  timeSlot.bookingDate = new Date();

  await session.save();
  return session;
};

export const sessionService = {
  createSession,
  updateSession,
  deleteSession,
  getUserSessions,
  getSessionById,
  getAllSessions,
  getAvailableTimeSlots,
  getSessionStatus,
  bookTimeSlot,
};
