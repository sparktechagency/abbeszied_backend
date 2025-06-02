import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { NotificationController } from './notification.controller';

const notificationRoutes = Router();

notificationRoutes
  .post(
    '/',
    auth(USER_ROLE.BUSINESS, USER_ROLE.USER, USER_ROLE.ADMIN),
    NotificationController.createNotification,
  )
  .get(
    '',
    auth(USER_ROLE.BUSINESS, USER_ROLE.USER, USER_ROLE.ADMIN),
    NotificationController.getSingleNotification,
  );

// notificationRoutes.get(
//   '/admin-all',
//   auth(USER_ROLE.ADMIN),
//   NotificationController.getAllNotificationByAdmin,
// );
// notificationRoutes.get('/:id', NotificationController.getSingleNotification);
// notificationRoutes.delete(
//   '/:id',
//   auth(USER_ROLE.MENTEE, USER_ROLE.MENTOR),
//   NotificationController.deletedNotification,
// );
// notificationRoutes.delete(
//   '/admin/:id',
//   auth(USER_ROLE.ADMIN),
//   NotificationController.deletedAdminNotification,
// );

export default notificationRoutes;
