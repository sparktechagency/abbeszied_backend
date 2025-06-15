import express from 'express';
import { sessionController } from './session.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { sessionValidation } from './session.validation';

const sessionRoutes = express.Router();

sessionRoutes
  // Create or add new date to session
  .post(
    '/',
    auth(USER_ROLE.COACH),
    validateRequest(sessionValidation.createSessionValidationSchema),
    sessionController.createSession,
  )

  // Update session (requires selectedDay in body to update specific daily session)
  .patch(
    '/',
    auth(USER_ROLE.COACH),
    validateRequest(sessionValidation.updateSessionValidationSchema),
    sessionController.updateSession,
  )

  // Book a time slot (for clients)
  .post(
    '/book',
    auth(USER_ROLE.CLIENT),
    validateRequest(sessionValidation.bookTimeSlotValidationSchema),
    sessionController.bookTimeSlot,
  )

  // Delete session (query param selectedDay to delete specific date, otherwise deletes entire session)
  .delete('/', auth(USER_ROLE.COACH), sessionController.deleteSession)

  // Get coach's sessions
  .get('/my-sessions', auth(USER_ROLE.COACH), sessionController.getUserSessions)
  .get(
    '/recommended-coach',
    auth(USER_ROLE.CLIENT),
    sessionController.getRecommendedCoach,
  )
  .get(
    '/recommended-coach/:id',
    auth(USER_ROLE.CLIENT),
    sessionController.getCoach,
  )
  // Read - Get coach's gallery
  .get(
    '/coach-gallery/:coachId',
    auth(USER_ROLE.CLIENT),
    sessionController.getGallery,
  )
  .get(
    '/coach-reviews/:coachId',
    auth(USER_ROLE.CLIENT),
    sessionController.getAllReview,
  )
  .get(
    '/coach-analysis/:coachId',
    auth(USER_ROLE.CLIENT),
    sessionController.getAnalysis,
  )
  .get(
    '/coach-certificates/:coachId',
    auth(USER_ROLE.CLIENT),
    sessionController.getUserCertificates,
  )
  // Get available time slots for a specific coach and date
  .get(
    '/available-slots',
    auth(USER_ROLE.CLIENT, USER_ROLE.COACH),
    sessionController.getAvailableTimeSlots,
  )
  .get(
    '/coach-work-history/:coachId',
    auth(USER_ROLE.CLIENT),
    sessionController.getUserWorkHistory,
  )
  // Get all sessions (admin access)
  .get('/', auth(USER_ROLE.ADMIN), sessionController.getAllSessions);

export default sessionRoutes;
