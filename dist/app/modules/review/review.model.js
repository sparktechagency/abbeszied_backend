"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    coachId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment: {
        type: String,
        required: false,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
}, { timestamps: true });
// Delete the model if it exists
// if (connection.models.Review) {
//      delete connection.models.Review;
//    }
exports.Review = (0, mongoose_1.model)('Review', reviewSchema);
