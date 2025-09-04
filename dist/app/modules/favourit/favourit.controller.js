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
exports.FavouriteCoachController = void 0;
// ===== CONTROLLER =====
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const favourit_service_1 = require("./favourit.service");
const toggleFavouriteCoach = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { sessionId } = req.params;
    const result = yield favourit_service_1.FavouriteCoachServices.toggleFavouriteCoach(userId, sessionId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: { isFavourite: result.isFavourite },
    });
}));
const getFavouriteCoaches = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield favourit_service_1.FavouriteCoachServices.getFavouriteCoaches(userId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Favourite coaches retrieved successfully',
        data: result.favouriteCoaches,
        meta: result.meta,
    });
}));
const removeFavouriteCoach = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { sessionId } = req.params;
    yield favourit_service_1.FavouriteCoachServices.removeFavouriteCoach(userId, sessionId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Coach removed from favourites successfully',
        data: null,
    });
}));
exports.FavouriteCoachController = {
    toggleFavouriteCoach,
    removeFavouriteCoach,
    getFavouriteCoaches,
};
