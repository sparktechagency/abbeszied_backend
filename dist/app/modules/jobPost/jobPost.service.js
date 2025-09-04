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
exports.JobPostService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const jobPost_model_1 = require("./jobPost.model");
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const favouritJobs_model_1 = require("../favourit jobs/favouritJobs.model");
const sendNotification_1 = require("../../helpers/sendNotification");
const user_models_1 = require("../user/user.models");
const category_model_1 = require("../category/category.model");
const checkIsFavourite = (jobId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const favouriteRecord = yield favouritJobs_model_1.FavouriteJob.findOne({ userId, jobId });
    const isFavourite = !!favouriteRecord;
    return isFavourite;
});
const createJobPostToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify user exists
    const user = yield user_models_1.User.findById(payload.postedBy);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const result = yield jobPost_model_1.JobPost.create(payload);
    try {
        yield user_models_1.User.findByIdAndUpdate(payload.postedBy, {
            $inc: { jobPostCount: 1 },
        });
        yield category_model_1.Category.findOneAndUpdate({ name: payload.jobCategory, type: "corporate" }, { $inc: { count: 1 } });
    }
    catch (error) {
        console.error('Failed to update job post count:', error);
    }
    return result;
});
const getAllJobPostsFromDB = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(jobPost_model_1.JobPost.find().populate('postedBy'), query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .salaryRange();
    const result = yield queryBuilder.modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    // 8. Process sessions with additional data (favorite and rating)
    const recommended = yield Promise.all(result.map((jobs) => __awaiter(void 0, void 0, void 0, function* () {
        const isFavorite = yield checkIsFavourite(jobs._id, userId);
        return Object.assign(Object.assign({}, jobs.toObject()), { isFavorite });
    })));
    return {
        meta,
        result: recommended,
    };
});
const getMyJobPosts = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(jobPost_model_1.JobPost.find({ postedBy: userId }).populate('postedBy'), query)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield queryBuilder.modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return {
        meta,
        result,
    };
});
const getJobPostByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.NOT_ACCEPTABLE, 'Invalid job post ID');
    }
    const result = yield jobPost_model_1.JobPost.findById(id).populate('postedBy');
    return result;
});
const updateJobPostToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.NOT_ACCEPTABLE, 'Invalid job post ID');
    }
    const result = yield jobPost_model_1.JobPost.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    }).populate('postedBy');
    return result;
});
const deleteJobPostFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.NOT_ACCEPTABLE, 'Invalid job post ID');
    }
    const result = yield jobPost_model_1.JobPost.findByIdAndDelete(id);
    return result;
});
const applyJob = (userId, jobPostId, application) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        throw new AppError_1.default(http_status_1.default.NOT_ACCEPTABLE, 'Invalid user ID');
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(jobPostId)) {
        throw new AppError_1.default(http_status_1.default.NOT_ACCEPTABLE, 'Invalid job post ID');
    }
    const result = yield jobPost_model_1.ApplyJob.create({
        userId,
        jobPostId,
        application,
    });
    yield jobPost_model_1.JobPost.findByIdAndUpdate(jobPostId, {
        $inc: { applicationSubmitted: 1 },
    });
    const client = yield user_models_1.User.findById(userId);
    const jobPost = yield jobPost_model_1.JobPost.findById(jobPostId);
    yield (0, sendNotification_1.sendNotifications)({
        receiver: jobPost === null || jobPost === void 0 ? void 0 : jobPost.postedBy,
        type: 'APPLICATION',
        message: `You have a new application from ${client === null || client === void 0 ? void 0 : client.fullName}`,
    });
    return result;
});
const getApplication = (id, query) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.NOT_ACCEPTABLE, 'Invalid job post ID');
    }
    const queryBuilder = new QueryBuilder_1.default(jobPost_model_1.ApplyJob.find({ jobPostId: id })
        .populate('userId', 'fullName email phone image verifiedBadge')
        .populate('jobPostId', 'jobCategory'), query);
    const result = yield queryBuilder
        .fields()
        .filter()
        .paginate()
        .sort()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return {
        meta,
        result,
    };
});
exports.JobPostService = {
    createJobPostToDB,
    getAllJobPostsFromDB,
    getJobPostByIdFromDB,
    updateJobPostToDB,
    deleteJobPostFromDB,
    getMyJobPosts,
    applyJob,
    getApplication,
};
