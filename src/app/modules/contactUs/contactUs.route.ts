import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { contactUsController } from './contactUs.controller';
import { inquiryValidations } from './contactUs.validation';
import validateRequest from '../../middleware/validateRequest';

const contactUsRoutes = express.Router();

contactUsRoutes
  .post(
    '/',
    auth(USER_ROLE.USER, USER_ROLE.BUSINESS),
    // validateRequest(inquiryValidations.verifyInquiryZodSchema),
    contactUsController.createContactUs,
  )
  .get('/', auth(USER_ROLE.ADMIN), contactUsController.getAllContactUs);

export default contactUsRoutes;
