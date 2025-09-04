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
exports.ChatController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const chat_service_1 = require("./chat.service");
const createChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = req.body.participant;
    const { userId } = req.user;
    const participants = [userId, participant];
    const result = yield chat_service_1.ChatService.createChatIntoDB(participants);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chat created successfully',
        data: result,
    });
}));
const markChatAsRead = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = req === null || req === void 0 ? void 0 : req.user;
    const result = yield chat_service_1.ChatService.markChatAsRead(user.id, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chat marked as read',
        data: result,
    });
}));
const getChats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield chat_service_1.ChatService.getAllChatsFromDB(userId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chats retrieved successfully',
        data: {
            chats: result.data,
            // Include chat statistics in data instead of meta
            unreadChatsCount: result.unreadChatsCount,
            totalUnreadMessages: result.totalUnreadMessages,
        },
        meta: result.meta, // Standard pagination meta
    });
}));
const deleteChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { chatId } = req.params;
    const result = yield chat_service_1.ChatService.softDeleteChatForUser(chatId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chat deleted successfully',
        data: result,
    });
}));
// New controller: Mute/Unmute chat
const muteUnmuteChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { chatId } = req.params;
    const { action } = req.body; // 'mute' or 'unmute'
    const result = yield chat_service_1.ChatService.muteUnmuteChat(userId, chatId, action);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Chat ${action}d successfully`,
        data: result,
    });
}));
// New controller: Block/Unblock user
const blockUnblockUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { chatId, targetUserId } = req.params;
    const { action } = req.body; // 'block' or 'unblock'
    const result = yield chat_service_1.ChatService.blockUnblockUser(userId, targetUserId, chatId, action);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `User ${action}ed successfully`,
        data: result,
    });
}));
exports.ChatController = {
    createChat,
    getChats,
    markChatAsRead,
    deleteChat,
    muteUnmuteChat,
    blockUnblockUser,
};
