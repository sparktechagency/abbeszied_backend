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
const AppError_1 = __importDefault(require("../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    search(searchableFields) {
        var _a;
        const searchTerm = (_a = this.query) === null || _a === void 0 ? void 0 : _a.searchTerm;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map((field) => ({
                    [field]: { $regex: searchTerm, $options: 'i' },
                })),
            });
        }
        return this;
    }
    filter() {
        const excludeFields = [
            'searchTerm',
            'sort',
            'limit',
            'page',
            'fields',
            'minPrice',
            'maxPrice',
            'maxSalary',
            'minSalary',
            'languages',
        ];
        const queryObj = Object.assign({}, this.query);
        excludeFields.forEach((el) => delete queryObj[el]);
        this.modelQuery = this.modelQuery.find(queryObj);
        return this;
    }
    sort() {
        var _a, _b, _c;
        const sort = ((_c = (_b = (_a = this.query) === null || _a === void 0 ? void 0 : _a.sort) === null || _b === void 0 ? void 0 : _b.split(',')) === null || _c === void 0 ? void 0 : _c.join(' ')) || '-createdAt';
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }
    paginate(defaultLimit = 10) {
        var _a, _b;
        const page = Number((_a = this.query) === null || _a === void 0 ? void 0 : _a.page) || 1;
        const limit = Number((_b = this.query) === null || _b === void 0 ? void 0 : _b.limit) || defaultLimit;
        const skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    fields() {
        var _a, _b, _c;
        const fields = ((_c = (_b = (_a = this.query) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0 ? void 0 : _b.split(',')) === null || _c === void 0 ? void 0 : _c.join(' ')) || '-__v';
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }
    priceRange() {
        var _a, _b;
        const priceFilter = {};
        const minPrice = ((_a = this.query) === null || _a === void 0 ? void 0 : _a.minPrice)
            ? Number(this.query.minPrice)
            : undefined;
        const maxPrice = ((_b = this.query) === null || _b === void 0 ? void 0 : _b.maxPrice)
            ? Number(this.query.maxPrice)
            : undefined;
        if (minPrice !== undefined && !isNaN(minPrice)) {
            priceFilter.$gte = minPrice;
        }
        if (maxPrice !== undefined && !isNaN(maxPrice)) {
            priceFilter.$lte = maxPrice;
        }
        if (Object.keys(priceFilter).length > 0) {
            this.modelQuery = this.modelQuery.find({
                price: priceFilter,
            });
        }
        return this;
    }
    experienceRange() {
        var _a, _b;
        const experienceFilter = {};
        const minExperience = ((_a = this.query) === null || _a === void 0 ? void 0 : _a.minExperience)
            ? Number(this.query.minExperience)
            : undefined;
        const maxExperience = ((_b = this.query) === null || _b === void 0 ? void 0 : _b.maxExperience)
            ? Number(this.query.maxExperience)
            : undefined;
        if (minExperience !== undefined && !isNaN(minExperience)) {
            experienceFilter.$gte = minExperience;
        }
        if (maxExperience !== undefined && !isNaN(maxExperience)) {
            experienceFilter.$lte = maxExperience;
        }
        if (Object.keys(experienceFilter).length > 0) {
            this.modelQuery = this.modelQuery.find({
                experience: experienceFilter,
            });
        }
        return this;
    }
    salaryRange() {
        var _a, _b;
        const minSalary = ((_a = this.query) === null || _a === void 0 ? void 0 : _a.minSalary)
            ? Number(this.query.minSalary)
            : undefined;
        const maxSalary = ((_b = this.query) === null || _b === void 0 ? void 0 : _b.maxSalary)
            ? Number(this.query.maxSalary)
            : undefined;
        const salaryFilters = [];
        if (minSalary !== undefined && !isNaN(minSalary)) {
            salaryFilters.push({ 'salary.max': { $gte: minSalary } });
        }
        if (maxSalary !== undefined && !isNaN(maxSalary)) {
            salaryFilters.push({ 'salary.max': { $lte: maxSalary } });
        }
        if (salaryFilters.length > 0) {
            this.modelQuery = this.modelQuery.find({
                $and: salaryFilters
            });
        }
        return this;
    }
    languageFilter() {
        var _a;
        let languages = (_a = this.query) === null || _a === void 0 ? void 0 : _a.languages;
        // Handle comma-separated string from query params
        if (typeof languages === 'string') {
            languages = languages.split(',').map((lang) => lang.trim());
        }
        if (languages && Array.isArray(languages) && languages.length > 0) {
            // Filter jobs that have any of the specified languages
            this.modelQuery = this.modelQuery.find({
                language: { $in: languages }
            });
        }
        return this;
    }
    countTotal() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const totalQueries = this.modelQuery.getFilter();
                const total = yield this.modelQuery.model.countDocuments(totalQueries);
                const page = Number((_a = this.query) === null || _a === void 0 ? void 0 : _a.page) || 1;
                const limit = Number((_b = this.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
                const totalPage = Math.ceil(total / limit);
                return { page, limit, total, totalPage };
            }
            catch (error) {
                throw new AppError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, error);
            }
        });
    }
}
exports.default = QueryBuilder;
