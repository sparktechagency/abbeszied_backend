import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { bookingController } from './booking.controller';
import { bookingValidation } from './booking.validation';

const bookingRoutes = express.Router();

bookingRoutes
  .post(
    '/create-payment-intent',
    auth(USER_ROLE.CLIENT),
    validateRequest(bookingValidation.createBookingSchema),
    bookingController.createPaymentIntent,
  )
  // Get all bookings
  .get(
    '/',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    bookingController.getAllBooking,
  )
  .get(
    '/single/:bookingId',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    bookingController.getSingleBooking,
  )
  .get(
    '/analysis',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    bookingController.getBookingAnalysis,
  )
  // Get user bookings
  .get(
    '/my-bookings',
    auth(USER_ROLE.CLIENT),
    bookingController.getUserBookings,
  )

  // Get coach bookings
  .get(
    '/coach-bookings',
    auth(USER_ROLE.COACH),
    bookingController.getCoachBookings,
  )

  // Get single booking
  .get(
    '/:bookingId',
    auth(USER_ROLE.CLIENT, USER_ROLE.COACH),
    bookingController.getBookingById,
  )

  // Cancel booking
  .patch(
    '/cancel/:bookingId',
    auth(USER_ROLE.CLIENT),
    validateRequest(bookingValidation.cancelBookingSchema),
    bookingController.cancelBooking,
  )

  // Complete booking (for coaches)
  .patch(
    '/complete/:bookingId',
    auth(USER_ROLE.COACH),
    bookingController.completeBooking,
  )
  // Reschedule booking
  .patch(
    '/reschedule/:bookingId',
    auth(USER_ROLE.CLIENT),
    validateRequest(bookingValidation.rescheduleBookingSchema),
    bookingController.rescheduleBooking,
  );

export default bookingRoutes;
