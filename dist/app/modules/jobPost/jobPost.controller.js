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
exports.JobPostController = void 0;
const jobPost_service_1 = require("./jobPost.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const fileHelper_1 = require("../../utils/fileHelper");
const createJobPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield jobPost_service_1.JobPostService.createJobPostToDB(Object.assign(Object.assign({}, req.body), { postedBy: userId }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Job post created successfully',
        data: result,
    });
}));
const getAllJobPosts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield jobPost_service_1.JobPostService.getAllJobPostsFromDB(req.query, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Job posts retrieved successfully',
        meta: result.meta,
        data: result.result,
    });
}));
const getMyJobPosts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield jobPost_service_1.JobPostService.getMyJobPosts(userId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Job posts retrieved successfully',
        meta: result.meta,
        data: result.result,
    });
}));
const getJobPostById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield jobPost_service_1.JobPostService.getJobPostByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Job post retrieved successfully',
        data: result,
    });
}));
const updateJobPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield jobPost_service_1.JobPostService.updateJobPostToDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Job post updated successfully',
        data: result,
    });
}));
const deleteJobPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield jobPost_service_1.JobPostService.deleteJobPostFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Job post deleted successfully',
        data: result,
    });
}));
const getApplication = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield jobPost_service_1.JobPostService.getApplication(id, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Job applications retrieved successfully',
        data: result.result,
        meta: result.meta,
    });
}));
const applyJob = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (req === null || req === void 0 ? void 0 : req.file) {
        req.body.application = (0, fileHelper_1.updateFileName)('applications', (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename);
    }
    const { id } = req.params;
    const { userId } = req.user;
    const result = yield jobPost_service_1.JobPostService.applyJob(userId, id, req.body.application);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Job applyed successfully',
        data: result,
    });
}));
exports.JobPostController = {
    createJobPost,
    getAllJobPosts,
    getJobPostById,
    updateJobPost,
    deleteJobPost,
    getMyJobPosts,
    applyJob,
    getApplication,
};
