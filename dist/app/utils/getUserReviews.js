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
const mongoose_1 = __importDefault(require("mongoose"));
const review_model_1 = require("../modules/review/review.model");
const getUserReview = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Aggregation to get reviews by rating
    const reting = yield review_model_1.Review.aggregate([
        {
            $match: { coachId: new mongoose_1.default.Types.ObjectId(id) },
        },
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    if (!reting || reting.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
        };
    }
    // Calculate the total count of reviews
    const totalReviews = reting.reduce((sum, item) => sum + item.count, 0);
    // Calculate the average rating
    const averageRating = reting.reduce((sum, item) => sum + item._id * item.count, 0) /
        totalReviews;
    return {
        averageRating,
        totalReviews,
    };
});
exports.default = getUserReview;
