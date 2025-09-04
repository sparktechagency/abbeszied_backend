"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const mongoose_1 = require("mongoose");
const reportSchema = new mongoose_1.Schema({
    produtId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    reporterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending',
    },
}, {
    timestamps: true,
});
exports.Report = (0, mongoose_1.model)('Report', reportSchema);
