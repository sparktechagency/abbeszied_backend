import express from 'express';
import { DashboardUserController } from './userManagment.controller';
import { userManagmentValidations } from './userManagment.validation';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  DashboardUserController.getAllUser,
);
router.get(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  DashboardUserController.getSingleUser,
);
router.patch(
  '/status/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  validateRequest(userManagmentValidations.updateStatus),
  DashboardUserController.updateStatus,
);

export const UserManagmentsRouter = router;
