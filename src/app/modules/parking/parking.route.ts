import { Router } from 'express';
import { parkingController } from './parking.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { fieldValidation } from './parking.validation';
import { USER_ROLE } from '../user/user.constants';
import parseData from '../../middleware/parseData';
import fileUpload from '../../middleware/fileUpload';
const upload = fileUpload('./public/uploads/parking');

export const parkingRoutes = Router();

parkingRoutes
  .post(
    '/',
    auth(USER_ROLE.BUSINESS),
    upload.fields([{ name: 'images', maxCount: 5 }]),
    parseData(),
    // validateRequest(fieldValidation.createFieldZodValidationSchema),
    parkingController.createParking,
  )
  .get(
    '/',
    auth(USER_ROLE.BUSINESS, USER_ROLE.USER, USER_ROLE.ADMIN),
    parkingController.getAllParking,
  )
  .get(
    '/business',
    auth(USER_ROLE.BUSINESS, USER_ROLE.ADMIN),
    parkingController.getAllBusinessParking,
  )
  .get(
    '/location',
    auth(USER_ROLE.BUSINESS, USER_ROLE.USER, USER_ROLE.ADMIN),
    parkingController.getAllParkingByLocation,
  )
  .get(
    '/:parkingId',
    auth(USER_ROLE.USER),
    parkingController.getParkingDetailsByParkingIdAndLocation,
  )
  .get(
    '/business/:parkingId',
    auth(USER_ROLE.BUSINESS, USER_ROLE.ADMIN),
    parkingController.getParkingDetailsforBusinessAndAdmin,
  )
  .get(
    '/available/next-30-days/:parkingId',
    auth(USER_ROLE.USER),
    parkingController.getBookingsForNext30Days,
  )
  .patch(
    '/:parkingId',
    upload.fields([{ name: 'images', maxCount: 5 }]),
    parseData(),
    auth(USER_ROLE.BUSINESS),
    parkingController.updateParking,
  )
  .patch(
    '/switch/:parkingId',

    auth(USER_ROLE.BUSINESS, USER_ROLE.ADMIN),
    parkingController.switchParkingStatus,
  )
  .delete(
    '/:parkingId',
    auth(USER_ROLE.BUSINESS),
    parkingController.deleteParking,
  );
