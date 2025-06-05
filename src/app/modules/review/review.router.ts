import express from 'express';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constants';
const router = express.Router();

router.get('/analysis', auth(USER_ROLE.COACH), ReviewController.getAnalysis);
router.get('/', auth(USER_ROLE.COACH), ReviewController.getAllReview);
router.post(
  '/create',
  auth(USER_ROLE.CLIENT),
  validateRequest(ReviewValidation.reviewZodSchema),
  ReviewController.createReview,
);
router.delete('/:id', auth(USER_ROLE.COACH), ReviewController.removeReview);

export const reviewRoutes = router;
