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
exports.experienceController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const experience_service_1 = require("./experience.service");
const fileHelper_1 = require("../../utils/fileHelper");
const addWorkHistory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield experience_service_1.experienceService.addWorkHistory(Object.assign(Object.assign({}, req.body), { userId }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Work history added successfully',
        data: result,
    });
}));
const updateWorkHistory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield experience_service_1.experienceService.updateWorkHistory(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Work history updated successfully',
        data: result,
    });
}));
const deleteWorkHistory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    const result = yield experience_service_1.experienceService.deleteWorkHistory(id, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Work history deleted successfully',
        data: result,
    });
}));
const getUserWorkHistory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield experience_service_1.experienceService.getUserWorkHistory(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Work history retrieved successfully',
        data: result,
    });
}));
const addCertificate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req.user;
    const { files } = req;
    const certificateFile = ((_b = (_a = files.certificateFile) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.filename)
        ? (0, fileHelper_1.updateFileName)('certificates', files.certificateFile[0].filename)
        : '';
    const result = yield experience_service_1.experienceService.addCertificate(Object.assign(Object.assign({}, req.body), { certificateFile,
        userId }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Certificate added successfully',
        data: result,
    });
}));
const updateCertificate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { files } = req;
    let payload = Object.assign({}, req.body);
    if ((_b = (_a = files === null || files === void 0 ? void 0 : files.certificateFile) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.filename) {
        payload.certificateFile = (0, fileHelper_1.updateFileName)('certificates', files.certificateFile[0].filename);
    }
    const result = yield experience_service_1.experienceService.updateCertificate(id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Certificate updated successfully',
        data: result,
    });
}));
const deleteCertificate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    const result = yield experience_service_1.experienceService.deleteCertificate(id, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Certificate deleted successfully',
        data: result,
    });
}));
const getUserCertificates = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield experience_service_1.experienceService.getUserCertificates(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Certificates retrieved successfully',
        data: result,
    });
}));
exports.experienceController = {
    addWorkHistory,
    updateWorkHistory,
    deleteWorkHistory,
    getUserWorkHistory,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    getUserCertificates,
};
