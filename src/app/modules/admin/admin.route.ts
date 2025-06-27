import express from 'express';
import { AdminController } from './admin.controller';
import { AdminValidation } from './admin.validation';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constants';
const router = express.Router();

router.post(
     '/create-admin',
     auth(USER_ROLE.SUPER_ADMIN),
     validateRequest(AdminValidation.createAdminZodSchema),
     AdminController.createAdmin,
);

router.get('/get-admins', auth(USER_ROLE.SUPER_ADMIN), AdminController.getAdmins);
router.get('/get-admin-support', AdminController.getAdmin);

router.delete('/:id', auth(USER_ROLE.SUPER_ADMIN), AdminController.deleteAdmin);

export const AdminRoutes = router;
