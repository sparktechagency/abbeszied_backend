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
exports.BannerController = void 0;
const banner_service_1 = require("./banner.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const fileHelper_1 = require("../../utils/fileHelper");
const createBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { body } = req;
    if (req === null || req === void 0 ? void 0 : req.file) {
        req.body.image = (0, fileHelper_1.updateFileName)('banners', (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename);
    }
    const result = yield banner_service_1.BannerService.createBannerToDB(body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Banner created successfully',
        data: result,
    });
}));
const getAllBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield banner_service_1.BannerService.getAllBannerFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Banner retrieved successfully',
        data: result.result,
        meta: result.meta,
    });
}));
const getClientBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientResult = yield banner_service_1.BannerService.getClientAllBannerFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Banner retrieved successfully',
        data: clientResult,
    });
}));
const getCorporateBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const corporateResult = yield banner_service_1.BannerService.getCorporateAllBannerFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Banner retrieved successfully',
        data: corporateResult,
    });
}));
const getCoachBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const coachResult = yield banner_service_1.BannerService.getCoachAllBannerFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Banner retrieved successfully',
        data: coachResult,
    });
}));
const getClientStoreBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientStoreResult = yield banner_service_1.BannerService.getClientStoreAllBannerFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Banner retrieved successfully',
        data: clientStoreResult,
    });
}));
const getCoachStoreBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const coachStoreResult = yield banner_service_1.BannerService.getCoachStoreAllBannerFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Banner retrieved successfully',
        data: coachStoreResult,
    });
}));
const updateBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    if (req === null || req === void 0 ? void 0 : req.file) {
        req.body.image = (0, fileHelper_1.updateFileName)('banners', (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename);
    }
    const result = yield banner_service_1.BannerService.updateBannerToDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Banner updated successfully',
        data: result,
    });
}));
const deleteBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield banner_service_1.BannerService.deleteBannerToDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Banner deleted successfully',
        data: result,
    });
}));
exports.BannerController = {
    createBanner,
    getAllBanner,
    getClientBanner,
    getCorporateBanner,
    getCoachBanner,
    getClientStoreBanner,
    getCoachStoreBanner,
    updateBanner,
    deleteBanner,
};
