import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import Notification from './notification.model';
import { TNotification } from './notification.interface';

const createNotification = async (payload: any) => {
  const result = await Notification.create(payload);
  return result;
};

const getSingleNotification = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  const notificationQuery = new QueryBuilder(
    Notification.find({ userId }),
    query,
  )
    .sort()
    .paginate()
    .fields();

  const result = await notificationQuery.modelQuery;
  const meta: any = await notificationQuery.countTotal();

  await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });

  meta.unreadCount = unreadCount;

  return { meta, result };
};
// const getAllNotificationQuery = async (
//   query: Record<string, unknown>,
//   userId: string,
// ) => {
//   const notificationQuery = new QueryBuilder(Notification.find({ userId }), query)
//     .search([''])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await notificationQuery.modelQuery;
//   const meta = await notificationQuery.countTotal();
//   return { meta, result };
// };

// const getAllNotificationByAdminQuery = async (
//   query: Record<string, unknown>,
// ) => {
//   const notificationQuery = new QueryBuilder(
//     Notification.find({ role: 'admin' }),
//     query,
//   )
//     .search([''])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await notificationQuery.modelQuery;
//   const meta = await notificationQuery.countTotal();
//   return { meta, result };
// };

// const deleteNotification = async (id: string, userId: string) => {

//   // Fetch the user by ID
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new AppError(404, 'User not found!');
//   }

//   const notification = await Notification.findById(id);
//   if (!notification) {
//     throw new AppError(404, 'Notification is not found!');
//   }

//   if (notification.userId.toString() !== userId) {
//     throw new AppError(
//       403,
//       'You are not authorized to access this notification!',
//     );
//   }

//   // Delete the SaveStory
//   const result = await Notification.findByIdAndDelete(id);
//   if (!result) {
//     throw new AppError(500, 'Error deleting SaveStory!');
//   }

//   return result;
// };

// const deleteAdminNotification = async (id: string) => {
//   const notification = await Notification.findById(id);
//   if (!notification) {
//     throw new AppError(404, 'Notification is not found!');
//   }

//   const result = await Notification.findOneAndDelete({
//     _id: id,
//     role: 'admin',
//   });
//   if (!result) {
//     throw new AppError(500, 'Error deleting SaveStory!');
//   }

//   return result;
// };

export const notificationService = {
  createNotification,
  getSingleNotification,
  // getAllNotificationQuery,
  // getAllNotificationByAdminQuery,
  // deleteNotification,
  // getSingleNotification,
  // deleteAdminNotification,
};
