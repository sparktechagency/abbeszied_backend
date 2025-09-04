"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const supportSchema = new mongoose_1.Schema({
    email: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        default: '',
    },
}, { timestamps: true });
// Create the model
const Support = (0, mongoose_1.model)('Support', supportSchema);
exports.default = Support;
