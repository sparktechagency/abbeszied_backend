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
exports.settingsController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const sattings_service_1 = require("./sattings.service");
const addSetting = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield sattings_service_1.settingsService.upsertSettings(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Setting added successfully',
        data: result,
    });
}));
const getSettings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield sattings_service_1.settingsService.getSettings(req.query.title);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Setting get successfully',
        data: result,
    });
}));
const getPrivacyPolicy = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const htmlContent = yield sattings_service_1.settingsService.getPrivacyPolicy();
    res.sendFile(htmlContent);
}));
const getAccountDelete = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const htmlContent = yield sattings_service_1.settingsService.getAccountDelete();
    res.sendFile(htmlContent);
}));
const getSupport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const htmlContent = yield sattings_service_1.settingsService.getSupport();
    res.sendFile(htmlContent);
}));
exports.settingsController = {
    getSettings,
    getPrivacyPolicy,
    getAccountDelete,
    getSupport,
    addSetting,
};
