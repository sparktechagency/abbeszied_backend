"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const booking_controller_1 = require("./booking.controller");
const booking_validation_1 = require("./booking.validation");
const bookingRoutes = express_1.default.Router();
bookingRoutes
    .post('/create-payment-intent', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), (0, validateRequest_1.default)(booking_validation_1.bookingValidation.createBookingSchema), booking_controller_1.bookingController.createPaymentIntent)
    // Get all bookings
    .get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), booking_controller_1.bookingController.getAllBooking)
    .get('/single/:bookingId', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), booking_controller_1.bookingController.getSingleBooking)
    .get('/analysis', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), booking_controller_1.bookingController.getBookingAnalysis)
    // Get user bookings
    .get('/my-bookings', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), booking_controller_1.bookingController.getUserBookings)
    // Get coach bookings
    .get('/coach-bookings', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), booking_controller_1.bookingController.getCoachBookings)
    // Get single booking
    .get('/:bookingId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH), booking_controller_1.bookingController.getBookingById)
    // Cancel booking
    .patch('/cancel/:bookingId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), (0, validateRequest_1.default)(booking_validation_1.bookingValidation.cancelBookingSchema), booking_controller_1.bookingController.cancelBooking)
    // Complete booking (for coaches)
    .patch('/complete/:bookingId', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), booking_controller_1.bookingController.completeBooking)
    // Reschedule booking
    .patch('/reschedule/:bookingId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), (0, validateRequest_1.default)(booking_validation_1.bookingValidation.rescheduleBookingSchema), booking_controller_1.bookingController.rescheduleBooking);
exports.default = bookingRoutes;
