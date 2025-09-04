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
exports.ProductsService = void 0;
const store_model_1 = __importDefault(require("./store.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const sendNotification_1 = require("../../helpers/sendNotification");
const addProduct = (payload, sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    // Add seller id to product
    const data = Object.assign(Object.assign({}, payload), { price: Number(payload.price), sellerId });
    // save to DB
    const result = yield store_model_1.default.create(data);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product creation failed');
    }
    return result;
});
const getProduct = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(store_model_1.default.find({ isApproved: 'approved', isDeleted: false }), query);
    // Fetch all products based on query filters, sorting, pagination, etc.
    const products = yield queryBuilder
        .search(['location', 'name', 'category'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .priceRange()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return { products, meta };
});
const getMyProduct = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(store_model_1.default.find({ sellerId: userId }), query);
    const products = yield queryBuilder
        .search(['location', 'name', 'category'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .priceRange()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return { products, meta };
});
const getSingleProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Use findById() to fetch the product and populate the seller and buyer fields
    const product = yield store_model_1.default.findById(id)
        .select('name price category description location condition images status sellerId buyerId') // Field selection
        .populate([
        { path: 'sellerId', select: 'fullName email phone createdAt image' },
        { path: 'buyerId', select: 'fullName email phone createdAt image' },
    ]);
    // Handle case where product doesn't exist
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    return product;
});
const markAsSold = (id, sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield store_model_1.default.findById(id);
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    if (product.status === 'sold') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product is already sold');
    }
    if (product.sellerId.toString() !== sellerId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not authorized');
    }
    // Ensure product has a buyer before marking as sold
    if (!product.buyerId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product has no buyer');
    }
    product.status = 'sold';
    const result = yield product.save();
    // Send notification but don't fail the operation if it fails
    try {
        yield (0, sendNotification_1.sendNotifications)({
            receiver: product.buyerId,
            type: 'ORDER',
            message: `Your order for ${product.name} has been marked as sold`,
        });
    }
    catch (error) {
        console.error('Failed to send notification:', error);
        // Could queue for retry or log to monitoring service
    }
    return result;
});
const deleteProduct = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield store_model_1.default.findById(id);
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    if (product.sellerId.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are not authorized');
    }
    const result = yield store_model_1.default.findByIdAndDelete(id);
    return result;
});
const updateProduct = (id, userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield store_model_1.default.findById(id);
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    if (product.sellerId.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are not authorized');
    }
    const result = yield store_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    return result;
});
exports.ProductsService = {
    addProduct,
    getProduct,
    getSingleProduct,
    getMyProduct,
    markAsSold,
    deleteProduct,
    updateProduct,
};
