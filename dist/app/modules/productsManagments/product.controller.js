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
exports.DashboardProductController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const product_service_1 = require("./product.service");
const getAllProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_service_1.DashboardProductService.getAllProductsFromDb(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Products retrieved successfully.',
        data: result.products,
        meta: result.meta,
    });
}));
const getSingleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield product_service_1.DashboardProductService.getSingleProductFromDb(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Product retrieved successfully.',
        data: result,
    });
}));
const deleteProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield product_service_1.DashboardProductService.deleteProductFromDb(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Product deleted successfully.',
        data: result,
    });
}));
const deleteMultipleProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productIds } = req.body;
    const result = yield product_service_1.DashboardProductService.deleteMultipleProductFromDb(productIds);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Products deleted successfully.',
        data: result,
    });
}));
const changeProductStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.body;
    const { id } = req.params;
    const result = yield product_service_1.DashboardProductService.changeProductStatusFromDb(id, status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Status update successfully',
        data: result,
    });
}));
exports.DashboardProductController = {
    getAllProducts,
    getSingleProduct,
    deleteProduct,
    deleteMultipleProducts,
    changeProductStatus,
};
