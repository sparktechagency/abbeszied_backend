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
exports.ChatService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const chat_model_1 = require("./chat.model");
const message_model_1 = require("../message/message.model");
const mongoose_1 = __importDefault(require("mongoose"));
const user_models_1 = require("../user/user.models");
const createChatIntoDB = (participants) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistChat = yield chat_model_1.Chat.findOne({
        participants: { $all: participants },
    });
    if (isExistChat) {
        return isExistChat;
    }
    const newChat = yield chat_model_1.Chat.create({
        participants: participants,
        lastMessage: null,
    });
    if (!newChat) {
        throw new Error('Failed to create chat');
    }
    //@ts-ignore
    const io = global.io;
    newChat.participants.forEach((participant) => {
        //@ts-ignore
        io.emit(`newChat::${participant._id}`, newChat);
    });
    return newChat;
});
const markChatAsRead = (userId, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    return chat_model_1.Chat.findByIdAndUpdate(chatId, { $addToSet: { readBy: userId } }, { new: true });
});
// 5. Updated getAllChatsFromDB with better unread count calculation
const getAllChatsFromDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const searchTerm = (_a = query.searchTerm) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const chatQuery = {
        participants: { $in: [userId] },
        deletedBy: { $ne: userId },
    };
    let chats;
    let totalChats;
    if (searchTerm) {
        const allChats = yield chat_model_1.Chat.find(chatQuery)
            .populate('lastMessage')
            .lean()
            .sort({ updatedAt: -1 });
        const allChatLists = yield Promise.all(allChats.map((chat) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const otherParticipantIds = chat.participants.filter((participantId) => participantId.toString() !== userId);
            const otherParticipants = yield user_models_1.User.find({
                _id: { $in: otherParticipantIds },
            })
                .select('_id image fullName email')
                .lean();
            // FIXED: Correct unread count calculation
            // Count messages where:
            // 1. Message is in this chat
            // 2. Message sender is NOT the current user
            // 3. Message is not read
            // 4. Message is not deleted
            const unreadCount = yield message_model_1.Message.countDocuments({
                chatId: chat._id,
                sender: { $ne: userId },
                read: false,
                isDeleted: false,
            });
            const isMuted = ((_a = chat.mutedBy) === null || _a === void 0 ? void 0 : _a.some((id) => id.toString() === userId)) || false;
            const isBlocked = ((_b = chat.blockedUsers) === null || _b === void 0 ? void 0 : _b.some((block) => block.blocker.toString() === userId ||
                block.blocked.toString() === userId)) || false;
            return Object.assign(Object.assign({}, chat), { participants: otherParticipants, isRead: unreadCount === 0, // Chat is read if no unread messages
                unreadCount,
                isMuted,
                isBlocked });
        })));
        const filteredChats = allChatLists.filter((chat) => {
            return chat.participants.some((participant) => participant.fullName.toLowerCase().includes(searchTerm));
        });
        totalChats = filteredChats.length;
        chats = filteredChats.slice(skip, skip + limit);
    }
    else {
        totalChats = yield chat_model_1.Chat.countDocuments(chatQuery);
        const rawChats = yield chat_model_1.Chat.find(chatQuery)
            .populate('lastMessage')
            .lean()
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit);
        chats = yield Promise.all(rawChats.map((chat) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const otherParticipantIds = chat.participants.filter((participantId) => participantId.toString() !== userId);
            const otherParticipants = yield user_models_1.User.find({
                _id: { $in: otherParticipantIds },
            })
                .select('_id image fullName email')
                .lean();
            // FIXED: Same unread count calculation
            const unreadCount = yield message_model_1.Message.countDocuments({
                chatId: chat._id,
                sender: { $ne: userId },
                read: false,
                isDeleted: false,
            });
            const isMuted = ((_a = chat.mutedBy) === null || _a === void 0 ? void 0 : _a.some((id) => id.toString() === userId)) || false;
            const isBlocked = ((_b = chat.blockedUsers) === null || _b === void 0 ? void 0 : _b.some((block) => block.blocker.toString() === userId ||
                block.blocked.toString() === userId)) || false;
            return Object.assign(Object.assign({}, chat), { participants: otherParticipants, isRead: unreadCount === 0, unreadCount,
                isMuted,
                isBlocked });
        })));
    }
    const unreadChatsCount = chats.filter((chat) => chat.unreadCount > 0).length;
    const totalUnreadMessages = chats.reduce((total, chat) => total + chat.unreadCount, 0);
    const totalPage = Math.ceil(totalChats / limit);
    return {
        data: chats,
        unreadChatsCount,
        totalUnreadMessages,
        meta: {
            limit,
            page,
            total: totalChats,
            totalPage,
        },
    };
});
const softDeleteChatForUser = (chatId, id) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = new mongoose_1.default.Types.ObjectId(id);
    const chat = yield chat_model_1.Chat.findById(chatId);
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Chat not found');
    }
    if (!chat.participants.some((id) => id.toString() === userId.toString())) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User is not authorized');
    }
    // If already deleted by this user, just return
    if (chat.deletedBy.some((id) => id.toString() === userId.toString())) {
        return chat;
    }
    // Add userId to deletedBy array
    chat.deletedBy.push(userId);
    // Optional: If all participants deleted, mark status deleted (soft delete for everyone)
    if (chat.deletedBy.length === chat.participants.length) {
        chat.isDeleted = true;
    }
    yield chat.save();
    //@ts-ignore
    const io = global.io;
    chat.participants.forEach((participant) => {
        //@ts-ignore
        io.emit(`chatDeletedForUser::${participant._id}`, { chatId, userId });
    });
    return chat;
});
// New feature: Mute/Unmute chat
const muteUnmuteChat = (userId, chatId, action) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_model_1.Chat.findById(chatId);
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Chat not found');
    }
    if (!chat.participants.some((id) => id.toString() === userId)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User is not authorized');
    }
    if (action === 'mute') {
        // Add user to mutedBy array if not already muted
        yield chat_model_1.Chat.findByIdAndUpdate(chatId, { $addToSet: { mutedBy: userId } }, { new: true });
    }
    else {
        // Remove user from mutedBy array
        yield chat_model_1.Chat.findByIdAndUpdate(chatId, { $pull: { mutedBy: userId } }, { new: true });
    }
    const updatedChat = yield chat_model_1.Chat.findById(chatId);
    //@ts-ignore
    const io = global.io;
    //@ts-ignore
    io.emit(`chatMuteStatus::${userId}`, {
        chatId,
        isMuted: action === 'mute',
        action,
    });
    return updatedChat;
});
// New feature: Block/Unblock user in chat
const blockUnblockUser = (blockerId, blockedId, chatId, action) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chat = yield chat_model_1.Chat.findById(chatId);
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Chat not found');
    }
    // Check if both users are participants
    const participants = chat.participants.map((p) => p.toString());
    if (!participants.includes(blockerId) || !participants.includes(blockedId)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'One or both users are not participants in this chat');
    }
    if (action === 'block') {
        // Check if already blocked
        const existingBlock = (_a = chat.blockedUsers) === null || _a === void 0 ? void 0 : _a.find((block) => block.blocker.toString() === blockerId &&
            block.blocked.toString() === blockedId);
        if (existingBlock) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User is already blocked');
        }
        // Add to blocked users
        yield chat_model_1.Chat.findByIdAndUpdate(chatId, {
            $push: {
                blockedUsers: {
                    blocker: blockerId,
                    blocked: blockedId,
                    blockedAt: new Date(),
                },
            },
        }, { new: true });
    }
    else {
        // Remove from blocked users
        yield chat_model_1.Chat.findByIdAndUpdate(chatId, {
            $pull: {
                blockedUsers: {
                    blocker: blockerId,
                    blocked: blockedId,
                },
            },
        }, { new: true });
    }
    const updatedChat = yield chat_model_1.Chat.findById(chatId);
    //@ts-ignore
    const io = global.io;
    // Notify both users
    [blockerId, blockedId].forEach((userId) => {
        //@ts-ignore
        io.emit(`userBlockStatus::${userId}`, {
            chatId,
            blockerId,
            blockedId,
            isBlocked: action === 'block',
            action,
        });
    });
    return updatedChat;
});
exports.ChatService = {
    createChatIntoDB,
    getAllChatsFromDB,
    markChatAsRead,
    softDeleteChatForUser,
    muteUnmuteChat,
    blockUnblockUser,
};
