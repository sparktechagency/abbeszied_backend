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
exports.FavouriteJobServices = void 0;
// ===== SERVICE =====
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const favouritJobs_model_1 = require("./favouritJobs.model");
const toggleFavouriteJob = (userId, jobId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const existingFavourite = yield favouritJobs_model_1.FavouriteJob.findOne({
            userId,
            jobId,
        }).session(session);
        if (existingFavourite) {
            // Remove from favourites
            yield favouritJobs_model_1.FavouriteJob.deleteOne({ userId, jobId }).session(session);
            yield session.commitTransaction();
            return {
                isFavourite: false,
                message: 'Job removed from favorites',
            };
        }
        else {
            // Add to favourites
            const newFavourite = new favouritJobs_model_1.FavouriteJob({ userId, jobId });
            yield newFavourite.save({ session });
            yield session.commitTransaction();
            return {
                isFavourite: true,
                message: 'Job added to favorites',
            };
        }
    }
    catch (error) {
        yield session.abortTransaction();
        console.error('Error during favorites toggle process:', error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'An error occurred while processing your favorites action');
    }
    finally {
        session.endSession();
    }
});
const removeFavouriteJob = (userId, jobId) => __awaiter(void 0, void 0, void 0, function* () {
    const favouriteJob = yield favouritJobs_model_1.FavouriteJob.findOne({ userId, jobId });
    if (!favouriteJob) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Job not found in favorites');
    }
    const deletedFavourite = yield favouritJobs_model_1.FavouriteJob.findByIdAndDelete(favouriteJob._id);
    if (!deletedFavourite) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to remove Job from favorites');
    }
    return deletedFavourite;
});
const getFavouriteJobs = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(favouritJobs_model_1.FavouriteJob.find({ userId }).populate({
        path: 'jobId',
        populate: {
            path: 'postedBy',
            select: 'fullName image language category',
        },
    }), query);
    const favouriteJobs = yield queryBuilder
        .fields()
        .paginate()
        .sort()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return {
        favouriteJobs,
        meta,
    };
});
exports.FavouriteJobServices = {
    toggleFavouriteJob,
    removeFavouriteJob,
    getFavouriteJobs,
};
