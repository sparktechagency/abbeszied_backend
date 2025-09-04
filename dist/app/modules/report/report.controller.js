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
exports.ReportController = void 0;
const report_service_1 = require("./report.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const fileHelper_1 = require("../../utils/fileHelper");
const createReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    req.body.reporterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (req === null || req === void 0 ? void 0 : req.file) {
        req.body.image = (0, fileHelper_1.updateFileName)('reports', (_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.filename);
    }
    const result = yield report_service_1.ReportService.createReport(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Report created successfully',
        data: result,
    });
}));
const getAllReports = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield report_service_1.ReportService.getAllReports(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reports retrieved successfully',
        data: result,
    });
}));
const giveWarningReportedPostAuthor = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield report_service_1.ReportService.giveWarningReportedPostAuthorToDB(id, req.body.message);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Report status updated successfully',
        data: result,
    });
}));
const deleteReportedPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield report_service_1.ReportService.deleteReportedPost(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Report status updated successfully',
        data: result,
    });
}));
exports.ReportController = {
    createReport,
    getAllReports,
    deleteReportedPost,
    giveWarningReportedPostAuthor,
};
