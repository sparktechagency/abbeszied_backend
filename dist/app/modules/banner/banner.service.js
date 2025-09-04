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
exports.BannerService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const banner_model_1 = require("./banner.model");
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const createBannerToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createBanner = yield banner_model_1.Banner.create(payload);
    return createBanner;
});
const getAllBannerFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(banner_model_1.Banner.find(), query)
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
const getClientAllBannerFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield banner_model_1.Banner.find({ type: 'client' });
});
const getCorporateAllBannerFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield banner_model_1.Banner.find({ type: 'corporate' });
});
const getCoachAllBannerFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield banner_model_1.Banner.find({ type: 'coach' });
});
const getClientStoreAllBannerFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield banner_model_1.Banner.find({ type: 'clientStore' });
});
const getCoachStoreAllBannerFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield banner_model_1.Banner.find({ type: 'coachStore' });
});
const updateBannerToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.NOT_ACCEPTABLE, 'Invalid ');
    }
    const banner = yield banner_model_1.Banner.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return banner;
});
const deleteBannerToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.NOT_ACCEPTABLE, 'Invalid ');
    }
    //delete from database
    yield banner_model_1.Banner.findByIdAndDelete(id);
    return;
});
exports.BannerService = {
    createBannerToDB,
    getAllBannerFromDB,
    updateBannerToDB,
    deleteBannerToDB,
    getClientAllBannerFromDB,
    getCorporateAllBannerFromDB,
    getCoachAllBannerFromDB,
    getClientStoreAllBannerFromDB,
    getCoachStoreAllBannerFromDB,
};
