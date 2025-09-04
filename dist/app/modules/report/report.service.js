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
exports.ReportService = void 0;
const report_model_1 = require("./report.model");
const mongoose_1 = __importDefault(require("mongoose"));
const store_model_1 = __importDefault(require("../store/store.model"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const user_models_1 = require("../user/user.models");
const sendNotification_1 = require("../../helpers/sendNotification");
const eamilNotifiacation_1 = require("../../utils/eamilNotifiacation");
const createReport = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield store_model_1.default.findById(payload.produtId);
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    const result = yield report_model_1.Report.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create report');
    }
    //   const getAdmin = await User.findOne({ role: USER_ROLE.SUPER_ADMIN });
    //   if (!getAdmin) {
    //     throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');
    //   }
    //   await sendNotifications({
    //     recipientRole: 'ADMIN',
    //     message: `A user has reported a product ${product.name}`,
    //     type: 'info',
    //     receiver: getAdmin._id,
    //   });
    yield (0, sendNotification_1.sendNotifications)({
        recipientRole: 'USER',
        message: `Your product ${product.name} has been reported`,
        type: 'info',
        receiver: product.sellerId,
    });
    //@ts-ignore
    //   const io = global.io;
    //   if (io) {
    //     io.emit(`notification::${product.sellerId.toString()}`, userNotification);
    //     io.emit(`notification::${getAdmin._id}`, adminNotification);
    //   }
    return result;
});
const getAllReports = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const reportQuery = new QueryBuilder_1.default(report_model_1.Report.find()
        .populate({
        path: 'postId',
        select: 'title images author',
        populate: {
            path: 'author',
            select: 'userName email',
        },
    })
        .populate({
        path: 'reporterId',
        select: 'userName email',
    }), query)
        .search(['reason', 'description'])
        .filter()
        .sort()
        .paginate();
    const result = yield reportQuery.modelQuery;
    const meta = yield reportQuery.countTotal();
    return {
        meta,
        result,
    };
});
const giveWarningReportedPostAuthorToDB = (reportId, message) => __awaiter(void 0, void 0, void 0, function* () {
    const report = yield report_model_1.Report.findById(reportId);
    if (!report) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Report not found');
    }
    const product = yield store_model_1.default.findById(report.produtId);
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    const seller = yield user_models_1.User.findById(product.sellerId);
    if (!seller) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Seller not found');
    }
    const result = yield report_model_1.Report.findByIdAndUpdate(reportId, {
        status: 'reviewed',
        new: true,
        runValidators: true,
    });
    const reportData = {
        name: seller.fullName,
        email: seller.email,
        produtcName: product.name,
        message: message,
    };
    yield (0, sendNotification_1.sendNotifications)({
        recipientRole: 'USER',
        message: `Your product ${product.name} has been reported`,
        type: 'info',
        receiver: product.sellerId,
    });
    //@ts-ignore
    //   const io = global.io;
    //   if (io) {
    //     io.emit(`notification::${product.sellerId.toString()}`, notification);
    //   }
    process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, eamilNotifiacation_1.reportWarning)({
            sentTo: reportData.email,
            subject: 'Community Guidelines Warning: Action Required',
            name: reportData.produtcName,
            seller: reportData.name,
            message: reportData.message,
        });
    }));
    return result;
});
const deleteReportedPost = (reportId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const isExist = yield report_model_1.Report.findById(reportId).session(session);
        if (!isExist) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Report not found');
        }
        yield store_model_1.default.findByIdAndUpdate(isExist.produtId, { isDeleted: true }, { session });
        yield report_model_1.Report.deleteOne({ _id: isExist._id }, { session });
        yield report_model_1.Report.findByIdAndUpdate(isExist._id, {
            status: 'resolved',
        }, { session, runValidators: true, new: true });
        yield session.commitTransaction();
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.ReportService = {
    createReport,
    getAllReports,
    deleteReportedPost,
    giveWarningReportedPostAuthorToDB,
};
