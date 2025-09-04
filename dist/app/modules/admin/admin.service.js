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
exports.AdminService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_constants_1 = require("../user/user.constants");
const user_models_1 = require("../user/user.models");
const createAdminToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    payload.role = user_constants_1.USER_ROLE.ADMIN;
    payload.isActive = true;
    payload.status = 'active';
    const createAdmin = yield user_models_1.User.create(payload);
    if (!createAdmin) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create Admin');
    }
    return createAdmin;
});
const deleteAdminFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistAdmin = yield user_models_1.User.findByIdAndDelete(id);
    if (!isExistAdmin) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete Admin');
    }
    return;
});
const getAdminsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const admins = yield user_models_1.User.find({ role: user_constants_1.USER_ROLE.ADMIN }).select('fullName email phone image role createdAt');
    return admins;
});
const getAdminFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const admins = yield user_models_1.User.find({ role: user_constants_1.USER_ROLE.SUPER_ADMIN }).select('fullName email phone image role createdAt');
    return admins;
});
exports.AdminService = {
    createAdminToDB,
    deleteAdminFromDB,
    getAdminFromDB,
    getAdminsFromDB
};
