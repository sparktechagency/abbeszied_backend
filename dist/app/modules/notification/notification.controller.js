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
exports.NotificationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const notification_service_1 = require("./notification.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const getNotificationFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield notification_service_1.NotificationService.getNotificationFromDB(user, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Notifications Retrieved Successfully',
        data: {
            result: result.result,
            unreadCount: result === null || result === void 0 ? void 0 : result.unreadCount,
        },
        meta: result === null || result === void 0 ? void 0 : result.meta,
    });
}));
const adminNotificationFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield notification_service_1.NotificationService.adminNotificationFromDB(userId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Notifications Retrieved Successfully',
        data: result === null || result === void 0 ? void 0 : result.result,
        meta: result === null || result === void 0 ? void 0 : result.meta,
    });
}));
const readNotification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield notification_service_1.NotificationService.readNotificationToDB(user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Notification Read Successfully',
        data: result,
    });
}));
const readNotificationSingle = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield notification_service_1.NotificationService.readNotificationSingleToDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Notification Read Successfully',
        data: result,
    });
}));
const adminReadNotification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_service_1.NotificationService.adminReadNotificationToDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Notification Read Successfully',
        data: result,
    });
}));
// send admin notifications to the users accaunts
const sendAdminNotification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_service_1.NotificationService.adminSendNotificationFromDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Notification Send Successfully',
        data: result,
    });
}));
exports.NotificationController = {
    adminNotificationFromDB,
    getNotificationFromDB,
    readNotification,
    adminReadNotification,
    sendAdminNotification,
    readNotificationSingle,
};
