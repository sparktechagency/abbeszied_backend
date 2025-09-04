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
exports.FavouriteJobController = void 0;
// ===== CONTROLLER =====
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const favouritJobs_service_1 = require("./favouritJobs.service");
const toggleFavouriteJob = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { jobId } = req.params;
    const result = yield favouritJobs_service_1.FavouriteJobServices.toggleFavouriteJob(userId, jobId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: { isFavourite: result.isFavourite },
    });
}));
const getFavouriteJobs = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield favouritJobs_service_1.FavouriteJobServices.getFavouriteJobs(userId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Favourite jobs retrieved successfully',
        data: result.favouriteJobs,
        meta: result.meta,
    });
}));
const removeFavouriteJob = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { jobId } = req.params;
    yield favouritJobs_service_1.FavouriteJobServices.removeFavouriteJob(userId, jobId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Job removed from favourites successfully',
        data: null,
    });
}));
exports.FavouriteJobController = {
    toggleFavouriteJob,
    removeFavouriteJob,
    getFavouriteJobs,
};
