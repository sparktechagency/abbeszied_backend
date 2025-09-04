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
exports.sessionController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const session_service_1 = require("./session.service");
const AppError_1 = __importDefault(require("../../error/AppError"));
const gallery_service_1 = require("../gallery/gallery.service");
const review_service_1 = require("../review/review.service");
const experience_service_1 = require("../experience/experience.service");
const createSession = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield session_service_1.sessionService.createSession(Object.assign(Object.assign({}, req.body), { coachId: userId }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Session created successfully',
        data: result,
    });
}));
const updateSession = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield session_service_1.sessionService.updateSession(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Session updated successfully',
        data: result,
    });
}));
const bookTimeSlot = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { coachId, selectedDay, startTime } = req.body;
    const result = yield session_service_1.sessionService.bookTimeSlot({
        coachId,
        selectedDay,
        startTime,
        clientId: userId,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Time slot booked successfully',
        data: result,
    });
}));
const deleteSession = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { selectedDay } = req.query;
    let result;
    if (selectedDay) {
        // Delete specific daily session
        result = yield session_service_1.sessionService.deleteSession(userId, new Date(selectedDay));
    }
    else {
        // Delete entire session document
        result = yield session_service_1.sessionService.deleteSession(userId);
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: selectedDay
            ? 'Daily session deleted successfully'
            : 'Session deleted successfully',
        data: result,
    });
}));
const getUserSessions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield session_service_1.sessionService.getUserSessions(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Sessions retrieved successfully',
        data: result,
    });
}));
const getCoachSession = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coachId } = req.params;
    const result = yield session_service_1.sessionService.getUserSessions(coachId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Sessions retrieved successfully',
        data: result,
    });
}));
const getRecommendedCoach = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield session_service_1.sessionService.getRecommendedCoach(userId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Coach retrieved successfully',
        data: result,
    });
}));
const getCoach = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield session_service_1.sessionService.getCoach(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Coach retrieved successfully',
        data: result,
    });
}));
const getAllSessions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield session_service_1.sessionService.getAllSessions();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All sessions retrieved successfully',
        data: result,
    });
}));
const getAvailableTimeSlots = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coachId, selectedDay } = req.query;
    if (!coachId || !selectedDay) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Coach ID and selected day are required');
    }
    const result = yield session_service_1.sessionService.getAvailableTimeSlots(coachId, new Date(selectedDay));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Available time slots retrieved successfully',
        data: result,
    });
}));
const getGallery = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coachId } = req.params;
    const result = yield gallery_service_1.GalleryService.getGallery(coachId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Gallery retrieved successfully',
        data: result,
    });
}));
const getAllReview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const { coachId } = req.params;
    const result = yield review_service_1.ReviewService.getReviews(coachId, query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Review retrieved Successfully',
        data: result.review,
        meta: result.meta,
    });
}));
const getAnalysis = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coachId } = req.params;
    const result = yield review_service_1.ReviewService.getReviewAnalysis(coachId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Review analysis retrieved Successfully',
        data: result,
    });
}));
const getUserCertificates = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coachId } = req.params;
    const result = yield experience_service_1.experienceService.getUserCertificates(coachId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Certificates retrieved successfully',
        data: result,
    });
}));
const getUserWorkHistory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coachId } = req.params;
    const result = yield experience_service_1.experienceService.getUserWorkHistory(coachId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Work history retrieved successfully',
        data: result,
    });
}));
exports.sessionController = {
    createSession,
    updateSession,
    bookTimeSlot,
    deleteSession,
    getUserSessions,
    getAllSessions,
    getAvailableTimeSlots,
    getRecommendedCoach,
    getCoach,
    getGallery,
    getAllReview,
    getAnalysis,
    getUserCertificates,
    getUserWorkHistory,
    getCoachSession,
};
