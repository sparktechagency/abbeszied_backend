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
exports.DashboardUserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_constants_1 = require("../user/user.constants");
const user_models_1 = require("../user/user.models");
// get all users
const allUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(user_models_1.User.find({ role: { $nin: [user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN] } }), // Exclude users with SUPER_ADMIN or ADMIN roles
    query);
    const users = yield queryBuilder
        .search(['fullName', 'email', 'address'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return { users, meta };
});
// get single users
const singleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_models_1.User.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found.');
    }
    return result;
});
// update  users
const updateUserStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_models_1.User.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found.');
    }
    return result;
});
exports.DashboardUserService = {
    allUser,
    singleUser,
    updateUserStatus
};
