import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { FavouriteCoachController } from './favourit.controller';

const router = express.Router();

// Toggle favourite status (add/remove)
router.post(
  '/:sessionId',
  auth(USER_ROLE.CLIENT),
  FavouriteCoachController.toggleFavouriteCoach,
);

// Get all favourite coaches
router.get(
  '/',
  auth(USER_ROLE.CLIENT),
  FavouriteCoachController.getFavouriteCoaches,
);

// Remove specific coach from favourites
router.delete(
  '/:sessionId',
  auth(USER_ROLE.CLIENT),
  FavouriteCoachController.removeFavouriteCoach,
);

export const FavouritdRouter = router;
