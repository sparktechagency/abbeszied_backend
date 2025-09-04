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
exports.Productcontroller = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const store_service_1 = require("./store.service");
const fileHelper_1 = require("../../utils/fileHelper");
const addProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { body, files } = req;
    const { userId } = req.user;
    const images = (_a = files.images) === null || _a === void 0 ? void 0 : _a.map((photo) => (0, fileHelper_1.updateFileName)('product', photo.filename));
    body.images = images;
    const result = yield store_service_1.ProductsService.addProduct(body, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Product added successfully.',
        data: result,
    });
}));
// get all products
const getAllProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield store_service_1.ProductsService.getProduct(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Product retrieved successfully.',
        data: result,
    });
}));
const getMyProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield store_service_1.ProductsService.getMyProduct(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Product retrieved successfully.',
        data: result,
    });
}));
const getProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield store_service_1.ProductsService.getSingleProduct(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Product retrieved successfully.',
        data: result,
    });
}));
const markSold = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    const result = yield store_service_1.ProductsService.markAsSold(id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Product mark as sold successfully.',
        data: result,
    });
}));
const deleteProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    const result = yield store_service_1.ProductsService.deleteProduct(id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Product delete successfully.',
        data: result,
    });
}));
const updateProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { body, files } = req;
    const { userId } = req.user;
    const images = (_a = files.images) === null || _a === void 0 ? void 0 : _a.map((photo) => (0, fileHelper_1.updateFileName)('images', photo.filename));
    body.images = images;
    const result = yield store_service_1.ProductsService.updateProduct(id, userId, body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Product update successfully.',
        data: result,
    });
}));
exports.Productcontroller = {
    addProduct,
    getAllProducts,
    getProduct,
    getMyProducts,
    markSold,
    deleteProduct,
    updateProduct,
};
