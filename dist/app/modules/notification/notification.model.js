"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
var NotificationType;
(function (NotificationType) {
    NotificationType["ADMIN"] = "ADMIN";
    NotificationType["SUPER_ADMIN"] = "SUPER_ADMIN";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["PAYMENT"] = "PAYMENT";
    NotificationType["MESSAGE"] = "MESSAGE";
    NotificationType["REFUND"] = "REFUND";
    NotificationType["ALERT"] = "ALERT";
    NotificationType["ORDER"] = "ORDER";
    NotificationType["DELIVERY"] = "DELIVERY";
    NotificationType["CANCELLED"] = "CANCELLED";
    NotificationType["RESCHEDULED"] = "RESCHEDULED";
    NotificationType["APPLICATION"] = "APPLICATION";
    NotificationType["BOOKING"] = "BOOKING";
})(NotificationType || (NotificationType = {}));
var NotificationScreen;
(function (NotificationScreen) {
    NotificationScreen["DASHBOARD"] = "DASHBOARD";
    NotificationScreen["PAYMENT_HISTORY"] = "PAYMENT_HISTORY";
    NotificationScreen["PROFILE"] = "PROFILE";
})(NotificationScreen || (NotificationScreen = {}));
const notificationSchema = new mongoose_1.Schema({
    message: {
        type: String,
        required: false,
    },
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Comment',
        required: false,
    },
    title: {
        type: String,
        required: false,
    },
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true,
    },
    reference: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'referenceModel',
        required: false,
    },
    referenceModel: {
        type: String,
        enum: [
            'PAYMENT',
            'ORDER',
            'MESSAGE',
            'REFUND',
            'ALERT',
            'DELIVERY',
            'CANCELLED',
            'BOOKING',
        ],
        required: false,
    },
    screen: {
        type: String,
        enum: Object.values(NotificationScreen),
        required: false,
    },
    read: {
        type: Boolean,
        default: false,
        index: true,
    },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: false,
    },
    // New fields for scheduling:
    sendAt: {
        type: Date,
        required: false, // optional, only set for scheduled notifications
        index: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'SEND', 'FAILED'],
        default: 'PENDING',
        index: true,
    },
}, {
    timestamps: true,
});
notificationSchema.index({ receiver: 1, read: 1 });
notificationSchema.index({ sendAt: 1, status: 1 }); // for efficient queries on scheduled notifications
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
