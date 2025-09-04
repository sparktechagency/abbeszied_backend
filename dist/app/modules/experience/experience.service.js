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
exports.experienceService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const experience_models_1 = require("./experience.models");
const user_models_1 = require("../user/user.models");
const addWorkHistory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.IsUserExistById(payload.userId.toString());
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const result = yield experience_models_1.WorkHistory.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Work history creating failed');
    }
    return result;
});
const updateWorkHistory = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield experience_models_1.WorkHistory.findById(id);
    if (!exists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Work history not found');
    }
    const result = yield experience_models_1.WorkHistory.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
const deleteWorkHistory = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield experience_models_1.WorkHistory.findOne({ _id: id, userId });
    if (!exists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Work history not found');
    }
    const result = yield experience_models_1.WorkHistory.findByIdAndDelete(id);
    return result;
});
const getUserWorkHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield experience_models_1.WorkHistory.find({ userId });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Work history not found');
    }
    return result;
});
const addCertificate = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.IsUserExistById(payload.userId.toString());
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const result = yield experience_models_1.Certificate.create(payload);
    return result;
});
const updateCertificate = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield experience_models_1.Certificate.findById(id);
    if (!exists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Certificate not found');
    }
    const result = yield experience_models_1.Certificate.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
const deleteCertificate = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield experience_models_1.Certificate.findOne({ _id: id, userId });
    if (!exists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Certificate not found');
    }
    const result = yield experience_models_1.Certificate.findByIdAndDelete(id);
    return result;
});
const getUserCertificates = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield experience_models_1.Certificate.find({ userId });
    return result;
});
exports.experienceService = {
    addWorkHistory,
    updateWorkHistory,
    deleteWorkHistory,
    getUserWorkHistory,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    getUserCertificates,
};
