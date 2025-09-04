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
exports.ReviewService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const review_model_1 = require("./review.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createReviewToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield review_model_1.Review.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create Review');
    }
    return result; // Return the created review
});
const deleteReviewToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield review_model_1.Review.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed To delete Review');
    }
    return result;
});
const getReviewAnalysis = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield review_model_1.Review.aggregate([
        {
            $match: {
                coachId: new mongoose_1.default.Types.ObjectId(id),
            },
        },
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    if (!stats) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No reviews found for this tutorial');
    }
    // Calculate average rating
    const totalReviews = stats.reduce((sum, stat) => sum + stat.count, 0);
    const averageRating = stats.reduce((sum, stat) => sum + stat._id * stat.count, 0) / totalReviews;
    // Prepare rating distribution with default values for missing ratings
    const ratingDistribution = {
        rating1: 0,
        rating2: 0,
        rating3: 0,
        rating4: 0,
        rating5: 0,
    };
    stats.forEach((stat) => {
        ratingDistribution[`rating${stat._id}`] =
            stat.count;
    });
    return {
        success: true,
        message: 'Review analysis retrieved Successfully',
        data: Object.assign({ averageRating: averageRating.toFixed(1), reviewCount: totalReviews }, ratingDistribution),
    };
});
const getReviews = (coachId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(review_model_1.Review.find({ coachId }).populate({
        path: 'clientId',
        select: 'fullName email image',
    }), query);
    const review = yield queryBuilder
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return {
        review,
        meta,
    };
});
exports.ReviewService = {
    createReviewToDB,
    deleteReviewToDB,
    getReviewAnalysis,
    getReviews,
};
