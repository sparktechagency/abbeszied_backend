import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
const router = express.Router();

router.get(
  '/',
  auth(
    USER_ROLE.CLIENT,
    USER_ROLE.ADMIN,
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.CORPORATE,
    USER_ROLE.COACH,
  ),
  NotificationController.getNotificationFromDB,
);
router.get(
  '/admin',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.adminNotificationFromDB,
);
router.patch(
  '/admin/single/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.readNotificationSingle,
);
router.patch(
  '/single/:id',
  auth(
    USER_ROLE.CLIENT,
    USER_ROLE.ADMIN,
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.CORPORATE,
    USER_ROLE.COACH,
  ),
  NotificationController.readNotificationSingle,
);
router.patch(
  '/',
  auth(
    USER_ROLE.CLIENT,
    USER_ROLE.ADMIN,
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.CORPORATE,
    USER_ROLE.COACH,
  ),
  NotificationController.readNotification,
);
router.patch(
  '/admin',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.adminReadNotification,
);
router.post(
  '/send-notification',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  NotificationController.sendAdminNotification,
);

export const NotificationRoutes = router;
