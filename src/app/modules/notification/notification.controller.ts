
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { NotificationService } from './notification.service';
import sendResponse from '../../utils/sendResponse';

const getNotificationFromDB = catchAsync(async (req, res) => {
     const user: any = req.user;
     const result = await NotificationService.getNotificationFromDB(user, req.query);

     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Notifications Retrieved Successfully',
          data: {
               result: result.result,
               unreadCount: result?.unreadCount,
          },
          meta: result?.meta,
     });
});

const adminNotificationFromDB = catchAsync(async (req, res) => {
     const { userId }: any = req.user;
     const result = await NotificationService.adminNotificationFromDB(userId, req.query);

     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Notifications Retrieved Successfully',
          data: result?.result,
          meta: result?.meta,
     });
});

const readNotification = catchAsync(async (req, res) => {
     const user: any = req.user;
     const result = await NotificationService.readNotificationToDB(user);

     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Notification Read Successfully',
          data: result,
     });
});
const readNotificationSingle = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await NotificationService.readNotificationSingleToDB(id);

     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Notification Read Successfully',
          data: result,
     });
});

const adminReadNotification = catchAsync(async (req, res) => {
     const result = await NotificationService.adminReadNotificationToDB();

     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Notification Read Successfully',
          data: result,
     });
});
// send admin notifications to the users accaunts
const sendAdminNotification = catchAsync(async (req, res) => {
     const result = await NotificationService.adminSendNotificationFromDB(req.body);
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Notification Send Successfully',
          data: result,
     });
});

export const NotificationController = {
     adminNotificationFromDB,
     getNotificationFromDB,
     readNotification,
     adminReadNotification,
     sendAdminNotification,
     readNotificationSingle,
};
