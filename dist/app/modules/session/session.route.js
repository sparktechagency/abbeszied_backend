"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const session_controller_1 = require("./session.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const session_validation_1 = require("./session.validation");
const sessionRoutes = express_1.default.Router();
sessionRoutes
    // Create or add new date to session
    .post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), (0, validateRequest_1.default)(session_validation_1.sessionValidation.createSessionValidationSchema), session_controller_1.sessionController.createSession)
    // Update session (requires selectedDay in body to update specific daily session)
    .patch('/', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), (0, validateRequest_1.default)(session_validation_1.sessionValidation.updateSessionValidationSchema), session_controller_1.sessionController.updateSession)
    // Book a time slot (for clients)
    .post('/book', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), (0, validateRequest_1.default)(session_validation_1.sessionValidation.bookTimeSlotValidationSchema), session_controller_1.sessionController.bookTimeSlot)
    // Delete session (query param selectedDay to delete specific date, otherwise deletes entire session)
    .delete('/', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), session_controller_1.sessionController.deleteSession)
    // Get coach's sessions
    .get('/my-sessions', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), session_controller_1.sessionController.getUserSessions)
    .get('/recommended-coach', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), session_controller_1.sessionController.getRecommendedCoach)
    .get('/recommended-coach/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), session_controller_1.sessionController.getCoach)
    // Read - Get coach's gallery
    .get('/coach-gallery/:coachId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), session_controller_1.sessionController.getGallery)
    .get('/coach-reviews/:coachId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), session_controller_1.sessionController.getAllReview)
    .get('/coach-analysis/:coachId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), session_controller_1.sessionController.getAnalysis)
    .get('/coach-certificates/:coachId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), session_controller_1.sessionController.getUserCertificates)
    .get('/coach-session/:coachId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), session_controller_1.sessionController.getCoachSession)
    // Get available time slots for a specific coach and date
    .get('/available-slots', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH), session_controller_1.sessionController.getAvailableTimeSlots)
    .get('/coach-work-history/:coachId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), session_controller_1.sessionController.getUserWorkHistory)
    // Get all sessions (admin access)
    .get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), session_controller_1.sessionController.getAllSessions);
exports.default = sessionRoutes;
