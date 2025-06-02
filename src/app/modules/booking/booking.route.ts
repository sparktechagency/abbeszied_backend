import { Router } from 'express';
import { parkingBookingController } from './booking.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

export const parkingBookingRoutes = Router();

parkingBookingRoutes
  .post(
    '/',
    auth(USER_ROLE.USER),
    parkingBookingController.createParkingBookingWebHook,
  )
  .get(
    '/',
    auth(USER_ROLE.BUSINESS, USER_ROLE.USER),
    parkingBookingController.getAllBookingByOwnerId,
  )
  .get(
    '/today-entry-exit',
    auth(USER_ROLE.BUSINESS),
    parkingBookingController.getTodayEntryOrExit,
  )
  .get(
    '/:bookingId',
    auth(USER_ROLE.BUSINESS, USER_ROLE.USER, USER_ROLE.ADMIN),
    parkingBookingController.getBookingDetails,
  );
