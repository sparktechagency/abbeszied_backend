import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { FavouriteJobController } from './favouritJobs.controller';

const router = express.Router();

// Toggle favourite status (add/remove)
router.post(
  '/:jobId',
  auth(USER_ROLE.COACH),
  FavouriteJobController.toggleFavouriteJob,
);

// Get all favourite jobs
router.get('/', auth(USER_ROLE.COACH), FavouriteJobController.getFavouriteJobs);

// Remove specific coach from favourites
router.delete(
  '/:jobId',
  auth(USER_ROLE.COACH),
  FavouriteJobController.removeFavouriteJob,
);

export const FavouritdJobRouter = router;
