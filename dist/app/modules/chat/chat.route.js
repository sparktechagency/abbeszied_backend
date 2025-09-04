"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = (0, express_1.Router)();
// Existing routes
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH), chat_controller_1.ChatController.getChats);
router.post('/create-chat', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH), chat_controller_1.ChatController.createChat);
router.patch('/mark-chat-as-read/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH), chat_controller_1.ChatController.markChatAsRead);
router.delete('/delete/:chatId', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH), chat_controller_1.ChatController.deleteChat);
// New routes for additional features
router.patch('/mute-unmute/:chatId', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH), chat_controller_1.ChatController.muteUnmuteChat);
router.patch('/block-unblock/:chatId/:targetUserId', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH), chat_controller_1.ChatController.blockUnblockUser);
exports.chatRoutes = router;
