import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { favouriteController } from './favourite.controller';

const favouriteRoutes = Router();

favouriteRoutes
  .post('/', auth(USER_ROLE.USER), favouriteController.createFavourite)
  .get(
    '/my-list',
    auth(USER_ROLE.BUSINESS, USER_ROLE.USER, USER_ROLE.ADMIN),
    favouriteController.getMyFavouriteList,
  );

export default favouriteRoutes;
