"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const session_models_1 = require("./session.models");
const user_models_1 = require("../../modules/user/user.models");
const mongoose_1 = require("mongoose");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const favourit_model_1 = require("../favourit/favourit.model");
const getUserReviews_1 = __importDefault(require("../../utils/getUserReviews"));
const checkIsFavourite = (sessionId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const favouriteRecord = yield favourit_model_1.Favourite.findOne({ userId, sessionId });
    const isFavourite = !!favouriteRecord;
    return isFavourite;
});
// Helper function to convert 12-hour format to 24-hour format
const convertTo24Hour = (time12h) => {
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
const convertTo12Hour = (time24h) => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};
// Helper function to get dates for next months based on day names
const getDatesByDayNames = (dayNames, months = 2) => {
    const dayMapping = {
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
    const dates = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + months);
    // Convert day names to numbers
    const targetDays = dayNames
        .map((day) => dayMapping[day.toLowerCase()])
        .filter((day) => day !== undefined);
    // Generate dates for the next specified months
    for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
        if (targetDays.includes(date.getDay())) {
            dates.push(new Date(date));
        }
    }
    return dates;
};
const createSession = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.IsUserExistById(payload.coachId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Determine if it's day names or single date
    let targetDates = [];
    if (Array.isArray(payload.selectedDay)) {
        // Day names provided - generate dates for next 2 months
        targetDates = getDatesByDayNames(payload.selectedDay, 2);
    }
    else {
        // Single date provided
        targetDates = [new Date(payload.selectedDay)];
    }
    if (targetDates.length === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'No valid dates found for the provided day names');
    }
    // Validate and process time slots
    const processedTimeSlots = payload.timeSlots.map((slot) => {
        let startTime24h;
        // Check if time includes AM/PM
        if (slot.startTime.includes('AM') ||
            slot.startTime.includes('PM') ||
            slot.startTime.includes('am') ||
            slot.startTime.includes('pm')) {
            startTime24h = convertTo24Hour(slot.startTime);
        }
        else {
            // Assume it's already in 24-hour format
            startTime24h = slot.startTime;
        }
        const start = new Date(`1970-01-01T${startTime24h}`);
        if (isNaN(start.getTime())) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid time format: ${slot.startTime}`);
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
    const existingSession = yield session_models_1.Session.findOne({
        coachId: new mongoose_1.Types.ObjectId(payload.coachId),
    });
    // const sessionPackage = payload.sessionPackage || SessionPackage.SINGLE;
    // const totalSessions = getPackageSessionCount(sessionPackage);
    if (existingSession) {
        // Add new dates to existing session
        const newDailySessions = targetDates.map((date) => ({
            selectedDay: date,
            timeSlots: processedTimeSlots,
            isActive: true,
        }));
        const result = yield session_models_1.Session.findOneAndUpdate({ coachId: new mongoose_1.Types.ObjectId(payload.coachId) }, {
            $push: { dailySessions: { $each: newDailySessions } },
            $set: {
                pricePerSession: payload.pricePerSession,
                language: payload.language || existingSession.language,
                // sessionPackage: sessionPackage,
                // totalSessions: totalSessions,
            },
        }, { new: true });
        return result;
    }
    else {
        // Create new session document
        const dailySessions = targetDates.map((date) => ({
            selectedDay: date,
            timeSlots: processedTimeSlots,
            isActive: true,
        }));
        const sessionData = {
            pricePerSession: payload.pricePerSession,
            dailySessions: dailySessions,
            language: payload.language || [],
            coachId: new mongoose_1.Types.ObjectId(payload.coachId),
            aboutMe: payload.aboutMe,
            category: user.category || '',
            experience: user.totalExpariance || 0,
            // sessionPackage: sessionPackage,
            // totalSessions: totalSessions,
            // bookedSessions: 0,
            isActive: true,
        };
        const result = yield session_models_1.Session.create(sessionData);
        return result;
    }
});
const updateSession = (coachId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield session_models_1.Session.findOne({
        coachId: new mongoose_1.Types.ObjectId(coachId),
    });
    if (!session) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Session not found');
    }
    const updateData = {};
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
        let targetDates = [];
        if (Array.isArray(payload.selectedDay)) {
            // Day names provided - generate dates for next 2 months
            targetDates = getDatesByDayNames(payload.selectedDay, 2);
        }
        else {
            // Single date provided
            targetDates = [new Date(payload.selectedDay)];
        }
        if (targetDates.length === 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'No valid dates found for the provided day names');
        }
        // Process time slots (same logic as createSession)
        const processedTimeSlots = payload.timeSlots.map((slot) => {
            let startTime24h;
            // Check if time includes AM/PM
            if (slot.startTime.includes('AM') ||
                slot.startTime.includes('PM') ||
                slot.startTime.includes('am') ||
                slot.startTime.includes('pm')) {
                startTime24h = convertTo24Hour(slot.startTime);
            }
            else {
                startTime24h = slot.startTime;
            }
            const start = new Date(`1970-01-01T${startTime24h}`);
            if (isNaN(start.getTime())) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid time format: ${slot.startTime}`);
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
        const newDailySessions = targetDates.map((date) => ({
            selectedDay: date,
            timeSlots: processedTimeSlots,
            isActive: true,
        }));
        // REPLACE all daily sessions with new ones (removes previous dates, sets new dates)
        updateData.dailySessions = newDailySessions;
    }
    // Update the session
    const result = yield session_models_1.Session.findOneAndUpdate({ coachId: new mongoose_1.Types.ObjectId(coachId) }, updateData, { new: true });
    return result;
});
// Book a time slot
const bookTimeSlot = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield session_models_1.Session.findOne({
        coachId: new mongoose_1.Types.ObjectId(payload.coachId),
    });
    if (!session) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Session not found');
    }
    // Convert time to 24-hour format if needed
    let startTime24h = payload.startTime;
    if (payload.startTime.includes('AM') ||
        payload.startTime.includes('PM') ||
        payload.startTime.includes('am') ||
        payload.startTime.includes('pm')) {
        startTime24h = convertTo24Hour(payload.startTime);
    }
    const result = yield session_models_1.Session.findOneAndUpdate({
        coachId: new mongoose_1.Types.ObjectId(payload.coachId),
        'dailySessions.selectedDay': payload.selectedDay,
        'dailySessions.timeSlots.startTime': startTime24h,
        'dailySessions.timeSlots.isBooked': false,
    }, {
        $set: {
            'dailySessions.$[session].timeSlots.$[slot].isBooked': true,
            'dailySessions.$[session].timeSlots.$[slot].clientId': new mongoose_1.Types.ObjectId(payload.clientId),
        },
        $inc: { bookedSessions: 1 },
    }, {
        arrayFilters: [
            { 'session.selectedDay': payload.selectedDay },
            { 'slot.startTime': startTime24h, 'slot.isBooked': false },
        ],
        new: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Time slot not available or already booked');
    }
    return result;
});
const deleteSession = (coachId, selectedDay) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield session_models_1.Session.findOne({
        coachId: new mongoose_1.Types.ObjectId(coachId),
    });
    if (!session) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Session not found');
    }
    if (selectedDay) {
        // Delete specific daily session
        const result = yield session_models_1.Session.findOneAndUpdate({ coachId: new mongoose_1.Types.ObjectId(coachId) }, { $pull: { dailySessions: { selectedDay: selectedDay } } }, { new: true });
        // If no daily sessions left, delete the entire session document
        if (result && result.dailySessions.length === 0) {
            yield session_models_1.Session.findByIdAndDelete(result._id);
            return null;
        }
        return result;
    }
    else {
        // Delete entire session document
        const result = yield session_models_1.Session.findOneAndDelete({
            coachId: new mongoose_1.Types.ObjectId(coachId),
        });
        return result;
    }
});
const getUserSessions = (coachId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield session_models_1.Session.findOne({
        coachId: new mongoose_1.Types.ObjectId(coachId),
    }).populate('coachId', 'fullName email');
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Session not found');
    }
    return result;
});
const getRecommendedCoach = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Get the user and their interests
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const userInterests = user.interests || [];
    let baseQuery;
    if (userInterests.length > 0) {
        baseQuery = session_models_1.Session.find({
            category: { $in: userInterests },
        }).select('pricePerSession coachId');
    }
    else {
        // If no interests, get all sessions
        baseQuery = session_models_1.Session.find().select('pricePerSession coachId');
    }
    // 4. Execute the base query to check for matching sessions
    const matchingSessions = yield baseQuery.exec();
    // 5. If no sessions matched, get all sessions
    if (matchingSessions.length === 0) {
        console.log('No matching sessions for user interests, returning all sessions');
        baseQuery = session_models_1.Session.find().select('pricePerSession coachId');
        baseQuery = baseQuery.populate('coachId', 'fullName email category image');
    }
    // 6. Build the query with filters, sorting, pagination, etc.
    const queryBuilder = new QueryBuilder_1.default(baseQuery, query);
    const result = yield queryBuilder
        .filter()
        .sort()
        .paginate()
        .fields()
        .search([])
        .priceRange()
        .languageFilter()
        .experienceRange()
        .modelQuery.exec();
    // 7. Count total number of sessions after filtering, sorting, etc.
    const meta = yield queryBuilder.countTotal();
    // 8. Process sessions with additional data (favorite and rating)
    const recommended = yield Promise.all(result.map((session) => __awaiter(void 0, void 0, void 0, function* () {
        const isFavorite = yield checkIsFavourite(session._id, userId);
        const rating = yield (0, getUserReviews_1.default)(session.coachId._id);
        return Object.assign(Object.assign({}, session.toObject()), { isFavorite,
            rating });
    })));
    // 9. Return the final result with metadata
    return {
        result: recommended,
        meta,
    };
});
const getAllSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield session_models_1.Session.find().populate('coachId', 'fullName email');
    return result;
});
const getAvailableTimeSlots = (coachId, selectedDay) => __awaiter(void 0, void 0, void 0, function* () {
    // Convert the selected day to start and end of day for query
    const dayStart = new Date(selectedDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDay);
    dayEnd.setHours(23, 59, 59, 999);
    const session = yield session_models_1.Session.findOne({
        coachId: new mongoose_1.Types.ObjectId(coachId),
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
        isbooked: slot.isBooked,
        pricePerSession: session.pricePerSession,
    }));
    return availableTimeSlots;
});
const getCoach = (coachId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield session_models_1.Session.findOne({
        coachId: new mongoose_1.Types.ObjectId(coachId),
    })
        .select('pricePerSession coachId')
        .populate('coachId')
        .lean();
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Session not found');
    }
    return result;
});
exports.sessionService = {
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
