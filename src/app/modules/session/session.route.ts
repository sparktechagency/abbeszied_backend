import express from 'express';
import { sessionController } from './session.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { sessionValidation } from './session.validation';

const sessionRoutes = express.Router();

sessionRoutes
  .post(
    '/',
    auth(USER_ROLE.COACH),
    validateRequest(sessionValidation.createSessionValidationSchema),
    sessionController.createSession,
  )
  .patch(
    '/:id',
    auth(USER_ROLE.COACH),
    validateRequest(sessionValidation.updateSessionValidationSchema),
    sessionController.updateSession,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.COACH),
    sessionController.deleteSession,
  )
  .get(
    '/my-sessions',
    auth(USER_ROLE.COACH),
    sessionController.getUserSessions,
  )
  .get(
    '/available-slots',
    auth(USER_ROLE.CLIENT, USER_ROLE.COACH),
    sessionController.getAvailableTimeSlots,
  )
  .get(
    '/status',
    auth(USER_ROLE.CLIENT),
    sessionController.getSessionStatus,
  )
  .post(
    '/book',
    auth(USER_ROLE.CLIENT),
    validateRequest(sessionValidation.bookTimeSlotValidationSchema),
    sessionController.bookTimeSlot,
  )
  .get(
    '/:id',
    auth(USER_ROLE.CLIENT, USER_ROLE.COACH),
    sessionController.getSessionById,
  )
  .get(
    '/',
    auth(USER_ROLE.CLIENT, USER_ROLE.ADMIN),
    sessionController.getAllSessions,
  );

export default sessionRoutes;