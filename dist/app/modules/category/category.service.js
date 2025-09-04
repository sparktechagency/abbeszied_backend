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
exports.CategoryService = void 0;
const category_model_1 = require("./category.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createCategoryToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, image, type } = payload;
    const isExistName = yield category_model_1.Category.findOne({ name: name });
    if (isExistName) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Category already exist');
    }
    const createCategory = yield category_model_1.Category.create({
        name,
        image,
        type,
    });
    return createCategory;
});
const getCategoriesFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Build the categories query with QueryBuilder
    const queryBuilder = new QueryBuilder_1.default(category_model_1.Category.find({}), query);
    // Execute chained query features: sort, paginate, select fields, filter, search
    const categories = yield queryBuilder
        .sort()
        .paginate()
        .fields()
        .filter()
        .search([]).modelQuery;
    // Get pagination/meta info
    const meta = yield queryBuilder.countTotal();
    // Return the meta info and updated categories array
    return {
        meta,
        categories,
    };
});
const updateCategoryToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCategory = yield category_model_1.Category.findById(id);
    if (!isExistCategory) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Category doesn't exist");
    }
    const updateCategory = yield category_model_1.Category.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return updateCategory;
});
const deleteCategoryToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteCategory = yield category_model_1.Category.findByIdAndDelete(id);
    if (!deleteCategory) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Category doesn't exist");
    }
    return deleteCategory;
});
const getClientCategory = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_model_1.Category.find({ type: 'coach' });
    return result;
});
const getCoachCategory = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_model_1.Category.find({ type: 'corporate' });
    return result;
});
const getStoreCategory = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_model_1.Category.find({ type: 'store' });
    return result;
});
exports.CategoryService = {
    createCategoryToDB,
    getCategoriesFromDB,
    updateCategoryToDB,
    deleteCategoryToDB,
    getClientCategory,
    getCoachCategory,
    getStoreCategory,
};
