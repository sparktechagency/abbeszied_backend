"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    chatId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Chat',
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    text: {
        type: String,
    },
    images: {
        type: [String],
        default: [],
    },
    read: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['text', 'image', 'doc', 'both'],
        default: 'text',
    },
    isDeleted: {
        type: Boolean,
        default: false,
        required: true,
    },
    // New pinned message fields
    isPinned: {
        type: Boolean,
        default: false,
    },
    pinnedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    pinnedAt: {
        type: Date,
    },
    reactions: [
        {
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                required: true,
                ref: 'User',
            },
            reactionType: {
                type: String,
                enum: ['like', 'love', 'thumbs_up', 'laugh', 'angry', 'sad'],
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true,
});
exports.Message = (0, mongoose_1.model)('Message', messageSchema);
