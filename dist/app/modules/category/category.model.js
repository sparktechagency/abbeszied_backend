"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const serviceSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['corporate', 'coach', 'store'],
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    image: {
        type: String,
        required: true,
    },
}, { timestamps: true });
exports.Category = (0, mongoose_1.model)('Category', serviceSchema);
