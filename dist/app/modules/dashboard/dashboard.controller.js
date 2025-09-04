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
exports.DashboardController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const dashboard_service_1 = require("./dashboard.service");
const AppError_1 = __importDefault(require("../../error/AppError"));
const getDashboardInfo = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const year = req.query.year
        ? Number(req.query.year)
        : new Date().getFullYear();
    if (!year || isNaN(Number(year))) {
        throw new AppError_1.default(400, 'Year must be a valid number');
    }
    const role = req.query.role ? String(req.query.role).toLowerCase() : null;
    // Check for valid role if it is provided
    // Check for valid role if it is provided
    if (role && !['coach', 'client'].includes(role)) {
        throw new AppError_1.default(400, 'Invalid role provided. Use "coach" or "client".');
    }
    const result = yield dashboard_service_1.DashboardService.userGraph(year, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Dashboard Info Retrieved Successfully',
        data: result,
    });
}));
const getDashboardStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Call the service to get the dashboard statistics
    const stats = yield dashboard_service_1.DashboardService.getDashboardStats();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Dashboard Stats Retrieved Successfully',
        data: stats,
    });
}));
exports.DashboardController = {
    getDashboardInfo,
    getDashboardStats
};
