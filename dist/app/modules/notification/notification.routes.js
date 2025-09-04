"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CORPORATE, user_constants_1.USER_ROLE.COACH), notification_controller_1.NotificationController.getNotificationFromDB);
router.get('/admin', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), notification_controller_1.NotificationController.adminNotificationFromDB);
router.patch('/admin/single/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), notification_controller_1.NotificationController.readNotificationSingle);
router.patch('/single/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CORPORATE, user_constants_1.USER_ROLE.COACH), notification_controller_1.NotificationController.readNotificationSingle);
router.patch('/', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CORPORATE, user_constants_1.USER_ROLE.COACH), notification_controller_1.NotificationController.readNotification);
router.patch('/admin', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), notification_controller_1.NotificationController.adminReadNotification);
router.post('/send-notification', (0, auth_1.default)(user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), notification_controller_1.NotificationController.sendAdminNotification);
exports.NotificationRoutes = router;
