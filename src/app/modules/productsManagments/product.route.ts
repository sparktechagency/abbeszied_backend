import express from 'express';
import { DashboardProductController } from './product.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middleware/auth';

const router = express.Router();
router.get(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  DashboardProductController.getAllProducts,
);

router.patch(
  '/status-change/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  DashboardProductController.changeProductStatus,
);
router.get(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  DashboardProductController.getSingleProduct,
);
router.delete(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  DashboardProductController.deleteProduct,
);
router.post(
  '/delete-multiple',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  DashboardProductController.deleteMultipleProducts,
);

export const ProductManagmentsRouter = router;
