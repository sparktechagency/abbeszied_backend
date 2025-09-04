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
exports.bookingController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const booking_service_1 = require("./booking.service");
const createPaymentIntent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { coachId, sessionId, selectedDay, startTime, endTime, price } = req.body;
    const result = yield booking_service_1.bookingService.createPaymentIntent({
        coachId,
        sessionId,
        selectedDay,
        startTime,
        endTime,
        price,
        userId,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Payment intent created successfully',
        data: result,
    });
}));
const getUserBookings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield booking_service_1.bookingService.getUserBookings(userId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User bookings retrieved successfully',
        data: result.bookings,
        meta: result.meta,
    });
}));
const getCoachBookings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield booking_service_1.bookingService.getCoachBookings(userId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Coach bookings retrieved successfully',
        data: result,
    });
}));
const getBookingById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, role } = req.user;
    const { bookingId } = req.params;
    const result = yield booking_service_1.bookingService.getBookingById(bookingId, userId, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking retrieved successfully',
        data: result,
    });
}));
const cancelBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { bookingId } = req.params;
    const { reason } = req.body;
    const result = yield booking_service_1.bookingService.cancelBooking(bookingId, userId, reason);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking cancelled successfully',
        data: result,
    });
}));
const completeBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { bookingId } = req.params;
    const result = yield booking_service_1.bookingService.completeBooking(bookingId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking completed successfully',
        data: result,
    });
}));
const rescheduleBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { bookingId } = req.params;
    const { newSelectedDay, newStartTime, newEndTime, reason } = req.body;
    const result = yield booking_service_1.bookingService.rescheduleBooking(bookingId, userId, {
        newSelectedDay,
        newStartTime,
        newEndTime,
        reason,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking rescheduled successfully',
        data: result,
    });
}));
const getAllBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield booking_service_1.bookingService.getAllBooking(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All bookings retrieved successfully',
        data: result.result,
        meta: result.meta,
    });
}));
const getSingleBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const result = yield booking_service_1.bookingService.getSingleBooking(bookingId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Bookings retrieved successfully',
        data: result,
    });
}));
const getBookingAnalysis = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Pass the date filter from the query parameter (e.g., today, thisWeek, etc.)
    const dateFilter = req.query.dateFilter || 'today'; // Default to today if no filter is provided
    const result = yield booking_service_1.bookingService.getBookingAnalysis(dateFilter);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking analysis retrieved successfully',
        data: result,
    });
}));
exports.bookingController = {
    createPaymentIntent,
    getAllBooking,
    getUserBookings,
    getCoachBookings,
    getBookingById,
    cancelBooking,
    completeBooking,
    rescheduleBooking,
    getSingleBooking,
    getBookingAnalysis
};
