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
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../error/AppError"));
const index_1 = __importDefault(require("../config/index"));
const user_models_1 = require("../modules/user/user.models");
const tokenManage_1 = require("../utils/tokenManage");
const user_constants_1 = require("../modules/user/user.constants");
const auth = (...userRoles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const tokenWithBearer = req.headers.authorization;
        if (!tokenWithBearer) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized !!');
        }
        if (!tokenWithBearer.startsWith('Bearer')) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Token send is not valid !!');
        }
        const token = tokenWithBearer === null || tokenWithBearer === void 0 ? void 0 : tokenWithBearer.split(' ')[1];
        if (!token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'you are not authorized!');
        }
        const decodeData = (0, tokenManage_1.verifyToken)({
            token,
            access_secret: index_1.default.jwt_access_secret,
        });
        const { role, userId } = decodeData;
        const isUserExist = yield user_models_1.User.IsUserExistById(userId);
        // console.log({ role, userId });
        if (!isUserExist) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'user not found');
        }
        if ((isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.status) === 'blocked') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked !!');
        }
        if (isUserExist.role === user_constants_1.USER_ROLE.COACH) {
            if ((isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.verifiedByAdmin) === 'pending' ||
                (isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.verifiedByAdmin) === 'rejected') {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Your account is ${isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.verifiedByAdmin} state. Please contact admin for more information.`);
            }
        }
        if (isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.isDeleted) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user accaunt is deleted !!');
        }
        if (userRoles && !userRoles.includes(role)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized this api');
        }
        req.user = decodeData;
        next();
    }));
};
exports.default = auth;
