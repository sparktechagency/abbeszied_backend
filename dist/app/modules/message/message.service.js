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
exports.MessageService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const chat_model_1 = require("../chat/chat.model");
const message_model_1 = require("./message.model");
const AppError_1 = __importDefault(require("../../error/AppError"));
const mongoose_1 = require("mongoose");
// Enhanced version with better error handling and logging
const sendMessageToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Check if chat exists
    const chat = yield chat_model_1.Chat.findById(payload.chatId);
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Chat not found');
    }
    // Verify sender is participant
    const isSenderParticipant = chat.participants.some((p) => p.toString() === payload.sender.toString());
    if (!isSenderParticipant) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Sender is not a participant in this chat');
    }
    // Check if sender is blocked
    const isBlocked = (_a = chat.blockedUsers) === null || _a === void 0 ? void 0 : _a.some((block) => (block.blocker.toString() === payload.sender.toString() &&
        chat.participants.some((p) => p.toString() === block.blocked.toString())) ||
        (block.blocked.toString() === payload.sender.toString() &&
            chat.participants.some((p) => p.toString() === block.blocker.toString())));
    if (isBlocked) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Cannot send message to blocked user');
    }
    // Create message with proper defaults
    const messagePayload = Object.assign(Object.assign({}, payload), { read: false, readAt: null, isDeleted: false, createdAt: new Date() });
    const response = yield message_model_1.Message.create(messagePayload);
    // Update chat - remove ALL participants from readBy except sender
    // This ensures unread count is calculated correctly
    yield chat_model_1.Chat.findByIdAndUpdate(response === null || response === void 0 ? void 0 : response.chatId, {
        lastMessage: response._id,
        readBy: [payload.sender.toString()], // Only sender has read it
        updatedAt: new Date(),
    }, { new: true });
    // Get populated message for socket
    const populatedMessage = yield message_model_1.Message.findById(response._id)
        .populate('sender', 'fullName email profile')
        .lean();
    // Get updated chat with populated data for chat list update
    const populatedChat = yield chat_model_1.Chat.findById(response === null || response === void 0 ? void 0 : response.chatId)
        .populate('participants', 'fullName email profile')
        .populate('lastMessage')
        .lean();
    // Socket emissions
    //@ts-ignore
    const io = global.io;
    if (chat.participants && io) {
        const otherParticipants = chat.participants.filter((participant) => participant && participant.toString() !== payload.sender.toString());
        // Emit to each participant
        otherParticipants.forEach((participantId) => {
            const participantIdStr = participantId.toString();
            // Emit new message
            io.emit(`newMessage::${participantIdStr}`, populatedMessage);
            // Emit unread count update - let frontend handle the increment
            io.emit(`unreadCountUpdate::${participantIdStr}`, {
                chatId: payload.chatId,
                action: 'increment', // Frontend should increment its local count
            });
            // Emit chat list update to move this chat to top
            io.emit(`chatListUpdate::${participantIdStr}`, {
                chatId: payload.chatId,
                chat: populatedChat,
                action: 'moveToTop',
                lastMessage: populatedMessage,
                updatedAt: new Date(),
            });
        });
        // Also emit chat list update to sender (to update their own chat list)
        const senderIdStr = payload.sender.toString();
        io.emit(`chatListUpdate::${senderIdStr}`, {
            chatId: payload.chatId,
            chat: populatedChat,
            action: 'moveToTop',
            lastMessage: populatedMessage,
            updatedAt: new Date(),
        });
    }
    return response;
});
const getMessagesFromDB = (chatId, userId, // Add userId parameter
query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit } = query;
    const pageInt = Math.max(parseInt(String(page || '1'), 10) || 1, 1);
    const limitInt = Math.min(Math.max(parseInt(String(limit || '10'), 10) || 10, 1), 100);
    const skip = (pageInt - 1) * limitInt;
    const total = yield message_model_1.Message.countDocuments({ chatId });
    const response = yield message_model_1.Message.find({ chatId })
        .populate({
        path: 'sender',
        select: 'fullName email profile',
    })
        .populate({ path: 'reactions.userId', select: 'fullName' })
        .populate({ path: 'pinnedBy', select: 'fullName' })
        .skip(skip)
        .limit(limitInt)
        .sort({ createdAt: -1 });
    // Mark messages as read for the current user (only messages not sent by current user)
    const messageIds = response
        .filter((msg) => msg.sender._id.toString() !== userId && !msg.read)
        .map((msg) => msg._id);
    if (messageIds.length > 0) {
        yield message_model_1.Message.updateMany({
            _id: { $in: messageIds },
            sender: { $ne: userId }, // Only update messages not sent by current user
        }, {
            $set: { read: true, readAt: new Date() },
        });
    }
    // Get pinned messages separately
    const pinnedMessages = yield message_model_1.Message.find({
        chatId,
        isPinned: true,
        isDeleted: false,
    })
        .populate({
        path: 'sender',
        select: 'fullName email profile',
    })
        .populate({ path: 'pinnedBy', select: 'fullName' })
        .sort({ pinnedAt: -1 });
    const formattedMessages = response.map((message) => (Object.assign(Object.assign({}, message.toObject()), { isDeleted: message.isDeleted, text: message.isDeleted ? 'This message has been deleted.' : message.text, read: true })));
    const formattedPinnedMessages = pinnedMessages.map((message) => (Object.assign(Object.assign({}, message.toObject()), { text: message.isDeleted ? 'This message has been deleted.' : message.text })));
    const totalPage = Math.ceil(total / limitInt);
    return {
        messages: formattedMessages,
        pinnedMessages: formattedPinnedMessages,
        pagination: {
            total,
            page: pageInt,
            limit: limitInt,
            totalPage,
        },
    };
});
const addReactionToMessage = (id, messageId, reactionType) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = new mongoose_1.Types.ObjectId(id);
    // Validate the reaction type
    const validReactions = ['like', 'love', 'thumbs_up', 'laugh', 'angry', 'sad'];
    if (!validReactions.includes(reactionType)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid reaction type');
    }
    try {
        // Find the message by ID
        const message = yield message_model_1.Message.findById(messageId);
        if (!message) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Message not found');
        }
        // Check if users are blocked
        const chat = yield chat_model_1.Chat.findById(message.chatId);
        if (chat) {
            const isBlocked = (_a = chat.blockedUsers) === null || _a === void 0 ? void 0 : _a.some((block) => (block.blocker.toString() === userId.toString() &&
                block.blocked.toString() === message.sender.toString()) ||
                (block.blocked.toString() === userId.toString() &&
                    block.blocker.toString() === message.sender.toString()));
            if (isBlocked) {
                throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Cannot react to messages from blocked users');
            }
        }
        // Check if the user has already reacted to the message
        const existingReaction = message.reactions.find((reaction) => reaction.userId.toString() === userId.toString());
        if (existingReaction) {
            // Update the existing reaction
            existingReaction.reactionType = reactionType;
            existingReaction.timestamp = new Date();
        }
        else {
            // Add a new reaction
            message.reactions.push({ userId, reactionType, timestamp: new Date() });
        }
        // Save the updated message
        const updatedMessage = yield message.save();
        return updatedMessage;
    }
    catch (error) {
        console.error('Error updating reaction:', error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Internal server error!');
    }
});
const deleteMessage = (userId, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the message by messageId
        const message = yield message_model_1.Message.findById(messageId);
        if (!message) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Message not found');
        }
        // Ensure the user is the sender of the message
        if (message.sender.toString() !== userId.toString()) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only delete your own messages');
        }
        const updateMessage = yield message_model_1.Message.findByIdAndUpdate(message._id, {
            $set: {
                isDeleted: true,
                isPinned: false, // Unpin message when deleted
                pinnedBy: undefined,
                pinnedAt: undefined,
            },
        }, { new: true });
        // If message was pinned, also remove from chat's pinnedMessages
        if (message.isPinned) {
            yield chat_model_1.Chat.findByIdAndUpdate(message.chatId, {
                $pull: { pinnedMessages: messageId },
            });
        }
        return updateMessage;
    }
    catch (error) {
        console.error('Error deleting message:', error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
});
// New feature: Pin/Unpin message
const pinUnpinMessage = (userId, messageId, action) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const message = yield message_model_1.Message.findById(messageId);
        if (!message) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Message not found');
        }
        // Check if user is participant in the chat
        const chat = yield chat_model_1.Chat.findById(message.chatId);
        if (!chat || !chat.participants.some((p) => p.toString() === userId)) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not authorized to pin messages in this chat');
        }
        // Check if users are blocked
        const isBlocked = (_a = chat.blockedUsers) === null || _a === void 0 ? void 0 : _a.some((block) => (block.blocker.toString() === userId &&
            block.blocked.toString() === message.sender.toString()) ||
            (block.blocked.toString() === userId &&
                block.blocker.toString() === message.sender.toString()));
        if (isBlocked) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Cannot pin messages from blocked users');
        }
        if (action === 'pin') {
            // Check if message is already pinned
            if (message.isPinned) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Message is already pinned');
            }
            // Check pinned messages limit (optional - limit to 10 pinned messages per chat)
            const pinnedCount = yield message_model_1.Message.countDocuments({
                chatId: message.chatId,
                isPinned: true,
                isDeleted: false,
            });
            if (pinnedCount >= 10) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Maximum 10 messages can be pinned per chat');
            }
            // Pin the message
            const updatedMessage = yield message_model_1.Message.findByIdAndUpdate(messageId, {
                $set: {
                    isPinned: true,
                    pinnedBy: userId,
                    pinnedAt: new Date(),
                },
            }, { new: true });
            // Add to chat's pinnedMessages array
            yield chat_model_1.Chat.findByIdAndUpdate(message.chatId, {
                $addToSet: { pinnedMessages: messageId },
            });
            //@ts-ignore
            const io = global.io;
            // Notify all participants
            chat.participants.forEach((participantId) => {
                //@ts-ignore
                io.emit(`messagePinned::${participantId}`, {
                    messageId,
                    chatId: message.chatId,
                    pinnedBy: userId,
                    message: updatedMessage,
                });
            });
            return updatedMessage;
        }
        else {
            // Unpin the message
            if (!message.isPinned) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Message is not pinned');
            }
            const updatedMessage = yield message_model_1.Message.findByIdAndUpdate(messageId, {
                $set: {
                    isPinned: false,
                    pinnedBy: undefined,
                    pinnedAt: undefined,
                },
            }, { new: true });
            // Remove from chat's pinnedMessages array
            yield chat_model_1.Chat.findByIdAndUpdate(message.chatId, {
                $pull: { pinnedMessages: messageId },
            });
            //@ts-ignore
            const io = global.io;
            // Notify all participants
            chat.participants.forEach((participantId) => {
                //@ts-ignore
                io.emit(`messageUnpinned::${participantId}`, {
                    messageId,
                    chatId: message.chatId,
                    unpinnedBy: userId,
                });
            });
            return updatedMessage;
        }
    }
    catch (error) {
        console.error('Error pinning/unpinning message:', error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
});
exports.MessageService = {
    sendMessageToDB,
    getMessagesFromDB,
    addReactionToMessage,
    deleteMessage,
    pinUnpinMessage,
};
