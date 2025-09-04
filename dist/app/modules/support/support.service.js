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
exports.SupportService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const support_model_1 = __importDefault(require("./support.model"));
const upsertSupport = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSupport = yield support_model_1.default.findOne({});
    if (existingSupport) {
        const updatedSupport = yield support_model_1.default.findOneAndUpdate({}, data, {
            new: true,
        });
        return updatedSupport;
    }
    else {
        const newSupport = yield support_model_1.default.create(data);
        if (!newSupport) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to add Support');
        }
        return newSupport;
    }
});
const getSupport = () => __awaiter(void 0, void 0, void 0, function* () {
    const support = yield support_model_1.default.findOne();
    if (!support) {
        ('');
    }
    return support;
});
exports.SupportService = {
    upsertSupport,
    getSupport,
};
