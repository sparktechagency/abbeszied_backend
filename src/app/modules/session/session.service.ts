import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { ISession, IDailySession } from './session.interface';
import { Session } from './session.models';
import { User } from '../../modules/user/user.models';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { Favourite } from '../favourit/favourit.model';
import getUserReview from '../../utils/getUserReviews';

const checkIsFavourite = async (sessionId: string, userId: string) => {
  const favouriteRecord = await Favourite.findOne({ userId, sessionId });
  const isFavourite = !!favouriteRecord;
  return isFavourite;
};

// Helper function to convert 12-hour format to 24-hour format
const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM' || modifier === 'pm') {
    hours = (parseInt(hours, 10) + 12).toString();
  }

  return `${hours.padStart(2, '0')}:${minutes}`;
};

// Helper function to convert 24-hour format to 12-hour format
const convertTo12Hour = (time24h: string): string => {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Helper function to get dates for next months based on day names
const getDatesByDayNames = (dayNames: string[], months: number = 2): Date[] => {
  const dayMapping: { [key: string]: number } = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  };

  const dates: Date[] = [];
  const today = new Date();
  const endDate = new Date();
  endDate.setMonth(today.getMonth() + months);

  // Convert day names to numbers
  const targetDays = dayNames
    .map((day) => dayMapping[day.toLowerCase()])
    .filter((day) => day !== undefined);

  // Generate dates for the next specified months
  for (
    let date = new Date(today);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    if (targetDays.includes(date.getDay())) {
      dates.push(new Date(date));
    }
  }

  return dates;
};

const createSession = async (payload: {
  coachId: string;
  pricePerSession: number;
  aboutMe: string;
  selectedDay: string[] | Date; // Can be day names array or single date
  timeSlots: any[];
  language?: string[];
}) => {
  const user = await User.IsUserExistById(payload.coachId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Determine if it's day names or single date
  let targetDates: Date[] = [];

  if (Array.isArray(payload.selectedDay)) {
    // Day names provided - generate dates for next 2 months
    targetDates = getDatesByDayNames(payload.selectedDay, 2);
  } else {
    // Single date provided
    targetDates = [new Date(payload.selectedDay)];
  }

  if (targetDates.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No valid dates found for the provided day names',
    );
  }

  // Validate and process time slots
  const processedTimeSlots = payload.timeSlots.map((slot) => {
    let startTime24h: string;

    // Check if time includes AM/PM
    if (
      slot.startTime.includes('AM') ||
      slot.startTime.includes('PM') ||
      slot.startTime.includes('am') ||
      slot.startTime.includes('pm')
    ) {
      startTime24h = convertTo24Hour(slot.startTime);
    } else {
      // Assume it's already in 24-hour format
      startTime24h = slot.startTime;
    }

    const start = new Date(`1970-01-01T${startTime24h}`);
    if (isNaN(start.getTime())) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Invalid time format: ${slot.startTime}`,
      );
    }

    // Calculate end time (1 hour after start)
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const endTime24h = end.toTimeString().slice(0, 5);
    const endTime12h = convertTo12Hour(endTime24h);

    return {
      startTime: startTime24h,
      startTime12h: convertTo12Hour(startTime24h),
      endTime: endTime24h,
      endTime12h: endTime12h,
      isBooked: false,
    };
  });

  // Check if session already exists for this coach
  const existingSession = await Session.findOne({
    coachId: new Types.ObjectId(payload.coachId),
  });

  // const sessionPackage = payload.sessionPackage || SessionPackage.SINGLE;
  // const totalSessions = getPackageSessionCount(sessionPackage);

  if (existingSession) {
    // Add new dates to existing session
    const newDailySessions: IDailySession[] = targetDates.map((date) => ({
      selectedDay: date,
      timeSlots: processedTimeSlots,
      isActive: true,
    }));

    const result = await Session.findOneAndUpdate(
      { coachId: new Types.ObjectId(payload.coachId) },
      {
        $push: { dailySessions: { $each: newDailySessions } },
        $set: {
          pricePerSession: payload.pricePerSession,
          language: payload.language || existingSession.language,
          // sessionPackage: sessionPackage,
          // totalSessions: totalSessions,
        },
      },
      { new: true },
    );
    return result;
  } else {
    // Create new session document
    const dailySessions: IDailySession[] = targetDates.map((date) => ({
      selectedDay: date,
      timeSlots: processedTimeSlots,
      isActive: true,
    }));

    const sessionData: ISession = {
      pricePerSession: payload.pricePerSession,
      dailySessions: dailySessions,
      language: payload.language || [],
      coachId: new Types.ObjectId(payload.coachId),
      aboutMe: payload.aboutMe,
      // sessionPackage: sessionPackage,
      // totalSessions: totalSessions,
      // bookedSessions: 0,
      isActive: true,
    };

    const result = await Session.create(sessionData);
    return result;
  }
};

const updateSession = async (
  coachId: string,
  payload: {
    pricePerSession?: number;
    aboutMe?: string;
    selectedDay?: string[] | Date; // Changed to match createSession - can be day names array or single date
    timeSlots?: any[];
    language?: string[];
    isActive?: boolean;
  },
) => {
  const session = await Session.findOne({
    coachId: new Types.ObjectId(coachId),
  });

  if (!session) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }

  const updateData: any = {};

  // Update global session fields
  if (payload.pricePerSession !== undefined) {
    updateData.pricePerSession = payload.pricePerSession;
  }
  if (payload.language !== undefined) {
    updateData.language = payload.language;
  }
  if (payload.isActive !== undefined) {
    updateData.isActive = payload.isActive;
  }
  if (payload.aboutMe !== undefined) {
    updateData.aboutMe = payload.aboutMe;
  }

  // Handle daily sessions update - following createSession pattern
  if (payload.selectedDay && payload.timeSlots) {
    // Determine if it's day names or single date (same logic as createSession)
    let targetDates: Date[] = [];

    if (Array.isArray(payload.selectedDay)) {
      // Day names provided - generate dates for next 2 months
      targetDates = getDatesByDayNames(payload.selectedDay, 2);
    } else {
      // Single date provided
      targetDates = [new Date(payload.selectedDay)];
    }

    if (targetDates.length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No valid dates found for the provided day names',
      );
    }

    // Process time slots (same logic as createSession)
    const processedTimeSlots = payload.timeSlots.map((slot) => {
      let startTime24h: string;

      // Check if time includes AM/PM
      if (
        slot.startTime.includes('AM') ||
        slot.startTime.includes('PM') ||
        slot.startTime.includes('am') ||
        slot.startTime.includes('pm')
      ) {
        startTime24h = convertTo24Hour(slot.startTime);
      } else {
        startTime24h = slot.startTime;
      }

      const start = new Date(`1970-01-01T${startTime24h}`);
      if (isNaN(start.getTime())) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid time format: ${slot.startTime}`,
        );
      }

      // Calculate end time (1 hour after start)
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const endTime24h = end.toTimeString().slice(0, 5);
      const endTime12h = convertTo12Hour(endTime24h);

      return {
        startTime: startTime24h,
        startTime12h: convertTo12Hour(startTime24h),
        endTime: endTime24h,
        endTime12h: endTime12h,
        isBooked: slot.isBooked || false,
      };
    });

    // Create new daily sessions (same logic as createSession)
    const newDailySessions: IDailySession[] = targetDates.map((date) => ({
      selectedDay: date,
      timeSlots: processedTimeSlots,
      isActive: true,
    }));

    // REPLACE all daily sessions with new ones (removes previous dates, sets new dates)
    updateData.dailySessions = newDailySessions;
  }

  // Update the session
  const result = await Session.findOneAndUpdate(
    { coachId: new Types.ObjectId(coachId) },
    updateData,
    { new: true },
  );

  return result;
};

// Book a time slot
const bookTimeSlot = async (payload: {
  coachId: string;
  selectedDay: Date[];
  startTime: string;
  clientId: string;
}) => {
  const session = await Session.findOne({
    coachId: new Types.ObjectId(payload.coachId),
  });

  if (!session) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }

  // Convert time to 24-hour format if needed
  let startTime24h = payload.startTime;
  if (
    payload.startTime.includes('AM') ||
    payload.startTime.includes('PM') ||
    payload.startTime.includes('am') ||
    payload.startTime.includes('pm')
  ) {
    startTime24h = convertTo24Hour(payload.startTime);
  }

  const result = await Session.findOneAndUpdate(
    {
      coachId: new Types.ObjectId(payload.coachId),
      'dailySessions.selectedDay': payload.selectedDay,
      'dailySessions.timeSlots.startTime': startTime24h,
      'dailySessions.timeSlots.isBooked': false,
    },
    {
      $set: {
        'dailySessions.$[session].timeSlots.$[slot].isBooked': true,
        'dailySessions.$[session].timeSlots.$[slot].clientId':
          new Types.ObjectId(payload.clientId),
      },
      $inc: { bookedSessions: 1 },
    },
    {
      arrayFilters: [
        { 'session.selectedDay': payload.selectedDay },
        { 'slot.startTime': startTime24h, 'slot.isBooked': false },
      ],
      new: true,
    },
  );

  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Time slot not available or already booked',
    );
  }

  return result;
};

const deleteSession = async (coachId: string, selectedDay?: Date) => {
  const session = await Session.findOne({
    coachId: new Types.ObjectId(coachId),
  });
  if (!session) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }

  if (selectedDay) {
    // Delete specific daily session
    const result = await Session.findOneAndUpdate(
      { coachId: new Types.ObjectId(coachId) },
      { $pull: { dailySessions: { selectedDay: selectedDay } } },
      { new: true },
    );

    // If no daily sessions left, delete the entire session document
    if (result && result.dailySessions.length === 0) {
      await Session.findByIdAndDelete(result._id);
      return null;
    }
    return result;
  } else {
    // Delete entire session document
    const result = await Session.findOneAndDelete({
      coachId: new Types.ObjectId(coachId),
    });
    return result;
  }
};

const getUserSessions = async (coachId: string) => {
  const result = await Session.findOne({
    coachId: new Types.ObjectId(coachId),
  }).populate('coachId', 'fullName email');
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }
  return result;
};
const getRecommendedCoach = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  // 1. Get the user and their interests
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userInterests = user.interests || [];

  // 2. Build the base query depending on user's interests
  let baseQuery;

  // Case when user has interests
  if (userInterests.length > 0) {
    // Attempt to find sessions where coach's category matches user's interests
    baseQuery = Session.find({
      'coachId.category': { $in: userInterests },
    }).select('pricePerSession coachId');
  } else {
    // If no interests, get all sessions
    baseQuery = Session.find().select('pricePerSession coachId');
  }

  // 3. Populate the coach information
  baseQuery = baseQuery.populate('coachId', 'fullName email category image');

  // 4. Execute the base query to check for matching sessions
  const matchingSessions = await baseQuery.exec();

  // 5. If no sessions matched, get all sessions
  if (matchingSessions.length === 0) {
    console.log(
      'No matching sessions for user interests, returning all sessions',
    );
    baseQuery = Session.find().select('pricePerSession coachId');
    baseQuery = baseQuery.populate('coachId', 'fullName email category image');
  }

  // 6. Build the query with filters, sorting, pagination, etc.
  const queryBuilder = new QueryBuilder(baseQuery, query);
  const result = await queryBuilder
    .filter() // Custom filter logic
    .sort() // Sorting logic
    .paginate() // Pagination logic
    .fields() // Select fields
    .search([]) // Search logic, if necessary
    .priceRange() // Price range filtering
    .modelQuery.exec();

  // 7. Count total number of sessions after filtering, sorting, etc.
  const meta = await queryBuilder.countTotal();

  // 8. Process sessions with additional data (favorite and rating)
  const recommended = await Promise.all(
    result.map(async (session: any) => {
      const isFavorite = await checkIsFavourite(session._id, userId);
      const rating = await getUserReview(session.coachId._id);
      return {
        ...session.toObject(),
        isFavorite,
        rating,
      };
    }),
  );

  // 9. Return the final result with metadata
  return {
    result: recommended,
    meta,
  };
};

const getAllSessions = async () => {
  const result = await Session.find().populate('coachId', 'fullName email');
  return result;
};

const getAvailableTimeSlots = async (coachId: string, selectedDay: Date) => {
  // Convert the selected day to start and end of day for query
  const dayStart = new Date(selectedDay);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(selectedDay);
  dayEnd.setHours(23, 59, 59, 999);

  const session = await Session.findOne({
    coachId: new Types.ObjectId(coachId),
    isActive: true,
    dailySessions: {
      $elemMatch: {
        selectedDay: {
          $gte: dayStart,
          $lte: dayEnd,
        },
        isActive: true,
      },
    },
  });
  console.log('session', session);

  if (!session) {
    return [];
  }

  // Find the specific daily session for the selected day
  const dailySession = session.dailySessions.find((ds) => {
    const dsDate = new Date(ds.selectedDay);
    dsDate.setHours(0, 0, 0, 0);
    const selectedDate = new Date(selectedDay);
    selectedDate.setHours(0, 0, 0, 0);
    return dsDate.getTime() === selectedDate.getTime() && ds.isActive;
  });

  if (!dailySession) {
    return [];
  }

  // Get available time slots
  const availableTimeSlots = dailySession.timeSlots
    .filter((slot) => !slot.isBooked)
    .map((slot) => ({
      sessionId: session._id,
      coachId: session.coachId,
      selectedDay: dailySession.selectedDay,
      startTime: slot.startTime,
      startTime12h: slot.startTime12h,
      endTime: slot.endTime,
      endTime12h: slot.endTime12h,
      pricePerSession: session.pricePerSession,
    }));

  return availableTimeSlots;
};
const getCoach = async (coachId: string) => {
  const result = await Session.findOne({
    coachId: new Types.ObjectId(coachId),
  })
    .select('pricePerSession coachId')
    .populate('coachId')
    .lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
  }

  return result;
};

export const sessionService = {
  createSession,
  updateSession,
  bookTimeSlot,
  deleteSession,
  getUserSessions,
  getAllSessions,
  getAvailableTimeSlots,
  getRecommendedCoach,
  getCoach,
};
