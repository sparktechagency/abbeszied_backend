"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_model_1 = require("./notification.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const user_models_1 = require("../user/user.models");
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_constants_1 = require("../user/user.constants");
const http_status_1 = __importDefault(require("http-status"));
const sendNotification_1 = require("../../helpers/sendNotification");
// get notifications
const getNotificationFromDB = (user, query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(notification_model_1.Notification.find({ receiver: user.userId }).populate('receiver', 'fullName email phone'), query);
    const result = yield queryBuilder
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    const unreadCount = yield notification_model_1.Notification.countDocuments({
        receiver: user.userId,
        read: false,
    });
    const data = {
        result,
        meta,
        unreadCount,
    };
    return data;
});
// read notifications only for user
const readNotificationToDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.updateMany({ receiver: user.userId, read: false }, { $set: { read: true } });
    return result;
});
const readNotificationSingleToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.findByIdAndUpdate(id, {
        $set: { read: true },
    }, {
        new: true,
    });
    return result;
});
// get notifications for admin
const adminNotificationFromDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Admin not found');
    }
    if (user.role === user_constants_1.USER_ROLE.SUPER_ADMIN || user.role === user_constants_1.USER_ROLE.ADMIN) {
        const querBuilder = new QueryBuilder_1.default(notification_model_1.Notification.find({ receiver: user._id }), query)
            .filter()
            .sort()
            .paginate()
            .fields();
        const result = yield querBuilder.modelQuery;
        const meta = yield querBuilder.countTotal();
        return {
            result,
            meta,
        };
    }
});
// read notifications only for admin
const adminReadNotificationToDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.updateMany({ type: 'ADMIN', read: false }, { $set: { read: true } }, { new: true });
    return result;
});
// const adminSendNotificationFromDB = async (payload: any) => {
//      const { title, message, receiver } = payload;
//      // Validate required fields
//      if (!title || !message) {
//           throw new AppError(httpStatus.BAD_REQUEST, 'Title and message are required');
//      }
//      // Handle specific receiver if provided
//      if (receiver && typeof receiver === 'string') {
//           const notificationData = {
//                title,
//                referenceModel: 'MESSAGE',
//                text: message,
//                type: 'ADMIN',
//                receiver,
//           };
//           try {
//                await sendNotifications(notificationData);
//           } catch (error) {
//                throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Error sending notification to receiver');
//           }
//      }
//      // Fetch users with role 'USER'
//      const users = await User.find({ role: 'USER' });
//      if (!users || users.length === 0) {
//           throw new AppError(httpStatus.NOT_FOUND, 'No users found');
//      }
//      // Send notification to all users
//      const notificationPromises = users.map((user) => {
//           const notificationData = {
//                title,
//                referenceModel: 'MESSAGE',
//                text: message,
//                type: 'ADMIN',
//                receiver: user._id,
//           };
//           return sendNotifications(notificationData);
//      });
//      try {
//           await Promise.all(notificationPromises);
//      } catch (error) {
//           throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Error sending notifications to users');
//      }
//      return;
// };
const adminSendNotificationFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, message, receiver, sendAt } = payload;
    // Validate required fields
    if (!title || !message) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Title and message are required');
    }
    // Helper to save notification for scheduling
    const saveScheduledNotification = (receiverId) => __awaiter(void 0, void 0, void 0, function* () {
        const notification = new notification_model_1.Notification({
            title,
            referenceModel: 'MESSAGE',
            text: message,
            type: 'ADMIN',
            receiver: receiverId,
            sendAt: new Date(sendAt),
            status: 'pending',
        });
        yield notification.save();
    });
    // Check if sendAt is provided and valid future date
    const hasValidSendAt = sendAt &&
        !isNaN(new Date(sendAt).getTime()) &&
        new Date(sendAt) > new Date();
    if (receiver && typeof receiver === 'string') {
        if (hasValidSendAt) {
            // Schedule notification for specific receiver
            yield saveScheduledNotification(receiver);
        }
        else {
            // Send immediately to specific receiver
            const notificationData = {
                title,
                referenceModel: 'MESSAGE',
                text: message,
                type: 'ADMIN',
                receiver,
            };
            try {
                yield (0, sendNotification_1.sendNotifications)(notificationData);
            }
            catch (error) {
                throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error sending notification to receiver');
            }
        }
    }
    else {
        // If no specific receiver, get all users with role 'USER'
        const users = yield user_models_1.User.find({ role: 'USER' });
        if (!users || users.length === 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No users found');
        }
        if (hasValidSendAt) {
            // Schedule notifications for all users
            const savePromises = users.map((user) => saveScheduledNotification(user._id));
            yield Promise.all(savePromises);
        }
        else {
            // Send notifications immediately to all users
            const notificationPromises = users.map((user) => {
                const notificationData = {
                    title,
                    referenceModel: 'MESSAGE',
                    text: message,
                    type: 'ADMIN',
                    receiver: user._id,
                };
                return (0, sendNotification_1.sendNotifications)(notificationData);
            });
            try {
                yield Promise.all(notificationPromises);
            }
            catch (error) {
                throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error sending notifications to users');
            }
        }
    }
});
exports.default = adminSendNotificationFromDB;
exports.NotificationService = {
    adminNotificationFromDB,
    getNotificationFromDB,
    readNotificationToDB,
    adminReadNotificationToDB,
    adminSendNotificationFromDB,
    readNotificationSingleToDB,
};
