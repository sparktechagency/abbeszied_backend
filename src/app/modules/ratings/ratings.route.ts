import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { reviewController } from './ratings.controller';

const reviewRouters = express.Router();

reviewRouters
  .post(
    '/',
    auth(USER_ROLE.USER),
    // validateRequest(videoValidation.VideoSchema),
    reviewController.createReview,
  )
  .get('/:parkingId', reviewController.getReviewByCustomer);

export default reviewRouters;
