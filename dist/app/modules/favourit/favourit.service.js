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
exports.FavouriteCoachServices = void 0;
// ===== SERVICE =====
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const favourit_model_1 = require("./favourit.model");
const toggleFavouriteCoach = (userId, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const existingFavourite = yield favourit_model_1.Favourite.findOne({
            userId,
            sessionId,
        }).session(session);
        if (existingFavourite) {
            // Remove from favourites
            yield favourit_model_1.Favourite.deleteOne({ userId, sessionId }).session(session);
            yield session.commitTransaction();
            return {
                isFavourite: false,
                message: 'Coach removed from favourites',
            };
        }
        else {
            // Add to favourites
            const newFavourite = new favourit_model_1.Favourite({ userId, sessionId });
            yield newFavourite.save({ session });
            yield session.commitTransaction();
            return {
                isFavourite: true,
                message: 'Coach added to favourites',
            };
        }
    }
    catch (error) {
        yield session.abortTransaction();
        console.error('Error during favourite toggle process:', error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'An error occurred while processing your favourite action');
    }
    finally {
        session.endSession();
    }
});
const removeFavouriteCoach = (userId, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const favouriteCoach = yield favourit_model_1.Favourite.findOne({ userId, sessionId });
    if (!favouriteCoach) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Coach not found in favourites');
    }
    const deletedFavourite = yield favourit_model_1.Favourite.findByIdAndDelete(favouriteCoach._id);
    if (!deletedFavourite) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to remove coach from favourites');
    }
    return deletedFavourite;
});
const getFavouriteCoaches = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(favourit_model_1.Favourite.find({ userId }).populate({
        path: 'sessionId',
        select: 'name pricePerSession',
        populate: {
            path: 'coachId',
            select: 'fullName image language category',
        },
    }), query);
    const favouriteCoaches = yield queryBuilder
        .fields()
        .paginate()
        .sort()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return {
        favouriteCoaches,
        meta,
    };
});
exports.FavouriteCoachServices = {
    toggleFavouriteCoach,
    removeFavouriteCoach,
    getFavouriteCoaches,
};
