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
exports.userController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const user_service_1 = require("./user.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const fileHelper_1 = require("../../utils/fileHelper");
const http_status_1 = __importDefault(require("http-status"));
const user_constants_1 = require("./user.constants");
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('first');
    const { body, files } = req;
    const cerificates = (_a = files.cerificates) === null || _a === void 0 ? void 0 : _a.map((photo) => (0, fileHelper_1.updateFileName)('profile', photo.filename));
    body.cerificates = cerificates;
    if (!body.role) {
        body.role = user_constants_1.USER_ROLE.CLIENT;
    }
    const data = yield user_service_1.userService.createUserToken(body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Create ${body.role} account successfully.`,
        data,
    });
}));
const userCreateVarification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.token;
    const { otp } = req.body;
    // console.log({ otp, token });
    const newUser = yield user_service_1.userService.otpVerifyAndCreateUser({ otp, token });
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User create successfully',
        data: newUser,
    });
}));
// rest >...............
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.getAllUserQuery(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: result.meta,
        data: result.result,
        message: 'Users All are requered successful!!',
    });
}));
const getAllUserCount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.getAllUserCount();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'All  users count successful!!',
    });
}));
const getAllUserRasio = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const yearQuery = req.query.year;
    // Safely extract year as string
    const year = typeof yearQuery === 'string' ? parseInt(yearQuery) : undefined;
    if (!year || isNaN(year)) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Invalid year provided!',
            data: {},
        });
    }
    const result = yield user_service_1.userService.getAllUserRatio(year);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Users All Ratio successful!!',
    });
}));
const getUserById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.getUserById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User fetched successfully',
        data: result,
    });
}));
const getMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield user_service_1.userService.getUserById((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Profile fetched successfully',
        data: result,
    });
}));
const updateMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const files = req.files;
    // Handle image upload
    if ((_a = files === null || files === void 0 ? void 0 : files.image) === null || _a === void 0 ? void 0 : _a[0]) {
        req.body.image = (0, fileHelper_1.updateFileName)('profile', files.image[0].filename);
    }
    // Handle introVideo upload
    if ((_b = files === null || files === void 0 ? void 0 : files.introVideo) === null || _b === void 0 ? void 0 : _b[0]) {
        req.body.introVideo = (0, fileHelper_1.updateFileName)('profile', files.introVideo[0].filename);
    }
    const result = yield user_service_1.userService.updateUser((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'profile updated successfully',
        data: result,
    });
}));
const updateOwnerStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { businessId } = req === null || req === void 0 ? void 0 : req.params;
    const result = yield user_service_1.userService.updateOwnerStatusService(businessId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'profile updated successfully',
        data: result,
    });
}));
const blockedUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.blockedUser(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User Blocked successfully',
        data: result,
    });
}));
const deleteMyAccount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield user_service_1.userService.deleteMyAccount((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User deleted successfully',
        data: result,
    });
}));
exports.userController = {
    createUser,
    userCreateVarification,
    getUserById,
    getMyProfile,
    getAllUsers,
    getAllUserCount,
    getAllUserRasio,
    updateMyProfile,
    updateOwnerStatus,
    blockedUser,
    deleteMyAccount,
};
