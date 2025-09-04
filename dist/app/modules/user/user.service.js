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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("./user.models");
const user_constants_1 = require("./user.constants");
const config_1 = __importDefault(require("../../config"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const otp_service_1 = require("../otp/otp.service");
const eamilNotifiacation_1 = require("../../utils/eamilNotifiacation");
const tokenManage_1 = require("../../utils/tokenManage");
const experience_models_1 = require("../experience/experience.models");
const category_model_1 = require("../category/category.model");
const createUserToken = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { email, role, fullName, cerificates } = payload;
    console.log('payload', payload);
    if (!(role === user_constants_1.USER_ROLE.CLIENT ||
        role === user_constants_1.USER_ROLE.COACH ||
        role === user_constants_1.USER_ROLE.CORPORATE)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid data!');
    }
    if (role === user_constants_1.USER_ROLE.CLIENT && !((_a = payload.interests) === null || _a === void 0 ? void 0 : _a.length)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'interests data is required!');
    }
    // user exist check
    const userExist = yield exports.userService.getUserByEmail(email);
    if (userExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User already exist!!');
    }
    try {
        if (payload.role === user_constants_1.USER_ROLE.COACH) {
            const findCategory = yield category_model_1.Category.findOne({
                name: payload.category,
                type: 'coach',
            });
            if (!findCategory) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Category not found!');
            }
            // Increment the count field
            findCategory.count += 1;
            // Save the updated category
            yield findCategory.save();
        }
    }
    catch (error) {
        console.log(error);
    }
    // send email
    process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, eamilNotifiacation_1.userCreateEmail)({
            sentTo: email,
            subject: 'Your one time otp for email  verification',
            name: fullName,
        });
    }));
    const user = yield user_models_1.User.create(payload);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User creation failed');
    }
    // Create certificates if provided
    if (cerificates && cerificates.length > 0) {
        const certificatePromises = cerificates.map((certificateFile) => {
            return experience_models_1.Certificate.create({
                certificateFile,
                userId: user._id,
            });
        });
        yield Promise.all(certificatePromises);
    }
    const jwtPayload = {
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        email: user.email,
        phone: user.phone,
        userId: (_b = user === null || user === void 0 ? void 0 : user._id) === null || _b === void 0 ? void 0 : _b.toString(),
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    const accessToken = (0, tokenManage_1.createToken)({
        payload: jwtPayload,
        access_secret: config_1.default.jwt_access_secret,
        expity_time: config_1.default.jwt_access_expires_in,
    });
    const refreshToken = (0, tokenManage_1.createToken)({
        payload: jwtPayload,
        access_secret: config_1.default.jwt_refresh_secret,
        expity_time: config_1.default.jwt_refresh_expires_in,
    });
    return {
        user: jwtPayload,
        accessToken,
        refreshToken,
    };
});
const otpVerifyAndCreateUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ otp, token, }) {
    if (!token) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Token not found');
    }
    const decodeData = (0, tokenManage_1.verifyToken)({
        token,
        access_secret: config_1.default.jwt_access_secret,
    });
    if (!decodeData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are not authorised');
    }
    const { password, email, fullName, role } = decodeData;
    if (!(role === 'user' || role === 'business')) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Provide valid data');
    }
    const isOtpMatch = yield otp_service_1.otpServices.otpMatch(email, otp);
    if (!isOtpMatch) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'OTP did not match');
    }
    process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () {
        yield otp_service_1.otpServices.updateOtpByEmail(email, {
            status: 'verified',
        });
    }));
    const userData = {
        password,
        email,
        fullName,
        role,
    };
    const isExist = yield user_models_1.User.isUserExist(email);
    if (isExist) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User already exists with this email');
    }
    const user = yield user_models_1.User.create(userData);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User creation failed');
    }
    return user;
});
// ............................rest
const getAllUserQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(user_models_1.User.find(), query)
        .search(['fullName', 'email', 'phone', 'role'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield queryBuilder.modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return { meta, result };
});
const getAllUserCount = () => __awaiter(void 0, void 0, void 0, function* () {
    const allUserCount = yield user_models_1.User.countDocuments();
    return allUserCount;
});
const getAllUserRatio = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfYear = new Date(year, 0, 1); // January 1st of the given year
    const endOfYear = new Date(year + 1, 0, 1); // January 1st of the next year
    // Create an array with all 12 months to ensure each month appears in the result
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        userCount: 0, // Default count of 0
    }));
    const userRatios = yield user_models_1.User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfYear,
                    $lt: endOfYear,
                },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' }, // Group by month (1 = January, 12 = December)
                userCount: { $sum: 1 }, // Count users for each month
            },
        },
        {
            $project: {
                month: '$_id', // Rename the _id field to month
                userCount: 1,
                _id: 0,
            },
        },
        {
            $sort: { month: 1 }, // Sort by month in ascending order (1 = January, 12 = December)
        },
    ]);
    // Merge the months array with the actual data to ensure all months are included
    const fullUserRatios = months.map((monthData) => {
        const found = userRatios.find((data) => data.month === monthData.month);
        return found ? found : monthData; // Use found data or default to 0
    });
    return fullUserRatios;
});
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_models_1.User.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return result;
});
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_models_1.User.findOne({ email });
    return result;
});
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = payload, rest = __rest(payload, ["email", "password", "role"]);
    const user = yield user_models_1.User.findByIdAndUpdate(id, rest, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User updating failed');
    }
    return user;
});
const updateOwnerStatusService = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const businessOwner = yield user_models_1.User.findById(businessId);
    if (!businessOwner) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const updateBusinessOwner = yield user_models_1.User.findByIdAndUpdate(businessId, { isActive: !businessOwner.isActive }, { new: true });
    if (!updateBusinessOwner) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User updating failed');
    }
    return updateBusinessOwner;
});
const deleteMyAccount = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.IsUserExistById(id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user === null || user === void 0 ? void 0 : user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted');
    }
    if (!(yield user_models_1.User.isPasswordMatched(payload.password, user.password))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password does not match');
    }
    const userDeleted = yield user_models_1.User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!userDeleted) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user deleting failed');
    }
    return userDeleted;
});
const blockedUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user deleting failed');
    }
    return user;
});
exports.userService = {
    createUserToken,
    otpVerifyAndCreateUser,
    getUserById,
    getUserByEmail,
    blockedUser,
    getAllUserQuery,
    getAllUserCount,
    getAllUserRatio,
    // isBusinessExist,
    updateUser,
    updateOwnerStatusService,
    deleteMyAccount,
};
