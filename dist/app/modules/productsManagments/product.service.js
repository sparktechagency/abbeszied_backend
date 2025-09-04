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
exports.DashboardProductService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const store_model_1 = __importDefault(require("../store/store.model"));
const getAllProductsFromDb = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(store_model_1.default.find({ isApproved: { $in: ['approved', 'pending'] } }).populate('sellerId', 'fullName'), query);
    const products = yield queryBuilder
        .search(['name', 'category', 'location'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return { products, meta };
});
const getSingleProductFromDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield store_model_1.default.findById(id).populate('sellerId', 'fullName images phone');
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    return result;
});
const deleteProductFromDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield store_model_1.default.findByIdAndDelete(id);
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    return result;
});
const deleteMultipleProductFromDb = (productIds) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield store_model_1.default.deleteMany({
        _id: { $in: productIds },
    });
    if (result.deletedCount === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Products not found');
    }
    return result;
});
const changeProductStatusFromDb = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield store_model_1.default.findByIdAndUpdate(id, { isApproved: status }, { new: true });
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    return result;
});
exports.DashboardProductService = {
    getAllProductsFromDb,
    getSingleProductFromDb,
    deleteProductFromDb,
    deleteMultipleProductFromDb,
    changeProductStatusFromDb
};
