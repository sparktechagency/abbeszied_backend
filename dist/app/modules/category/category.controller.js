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
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const fileHelper_1 = require("../../utils/fileHelper");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const createCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (req === null || req === void 0 ? void 0 : req.file) {
        req.body.image = (0, fileHelper_1.updateFileName)('category', (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename);
    }
    const result = yield category_service_1.CategoryService.createCategoryToDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Category create successfully',
        data: result,
    });
}));
const getCategories = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.CategoryService.getCategoriesFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Category retrieved successfully',
        data: result.categories,
        meta: result.meta,
    });
}));
const updateCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    const updateCategoryData = req.body;
    if (req === null || req === void 0 ? void 0 : req.file) {
        req.body.image = (0, fileHelper_1.updateFileName)('category', (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename);
    }
    const result = yield category_service_1.CategoryService.updateCategoryToDB(id, updateCategoryData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Category updated successfully',
        data: result,
    });
}));
const deleteCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield category_service_1.CategoryService.deleteCategoryToDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Category delete successfully',
        data: result,
    });
}));
const getClientCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.CategoryService.getClientCategory();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Category retrieved successfully',
        data: result,
    });
}));
const getCoachCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.CategoryService.getCoachCategory();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Category retrieved successfully',
        data: result,
    });
}));
const getStoreCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.CategoryService.getStoreCategory();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Category retrieved successfully',
        data: result,
    });
}));
exports.CategoryController = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    getClientCategory,
    getCoachCategory,
    getStoreCategory
};
