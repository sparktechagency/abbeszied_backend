import express from 'express';
import { SupportController } from './support.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = express.Router();

router
  .put(
    '/',
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
    SupportController.addSupport,
  )
  .get(
    '/',
    auth(
      USER_ROLE.COACH,
      USER_ROLE.CORPORATE,
      USER_ROLE.CLIENT,
      USER_ROLE.SUPER_ADMIN,
    ),
    SupportController.getSupport,
  );

export const supportRoutes = router;
