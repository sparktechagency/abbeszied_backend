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
exports.CertificateManagmentsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const experience_models_1 = require("../experience/experience.models");
const user_models_1 = require("../user/user.models");
const mongoose_1 = __importDefault(require("mongoose"));
const getAllCertificates = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(experience_models_1.Certificate.find({ verified: false }).populate('userId', 'fullName email verifiedByAdmin image phone'), query);
    const result = yield queryBuilder
        .fields()
        .filter()
        .paginate()
        .search(['title', 'description'])
        .sort()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return {
        result,
        meta,
    };
});
const getSingleCertificate = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield experience_models_1.Certificate.findById(id).populate('userId', 'fullName email verifiedByAdmin image phone');
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Certificate not found');
    }
    return result;
});
const updateStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession(); // Start a session
    session.startTransaction(); // Start the transaction
    try {
        // Fetch the certificate by ID within the session
        const certificate = yield experience_models_1.Certificate.findById(id).session(session);
        if (!certificate) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Certificate not found');
        }
        // Update the user's verifiedByAdmin status within the session
        const updatedUser = yield user_models_1.User.findByIdAndUpdate(certificate.userId, { verifiedByAdmin: status }, { new: true, session });
        if (!updatedUser) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        // Update all certificates associated with the user within the session
        const updateResult = yield experience_models_1.Certificate.updateMany({ userId: certificate.userId }, { $set: { verified: true } }, { session });
        // Check if any certificates were actually updated
        if (updateResult.modifiedCount === 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No certificates were updated');
        }
        // Commit the transaction after successful updates
        yield session.commitTransaction();
        // Return success message along with updated user and certificate result
        return {
            message: 'Status updated successfully',
            updatedUser,
            updateResult,
        };
    }
    catch (error) {
        // Rollback the transaction if any error occurs
        yield session.abortTransaction();
        console.error('Error during status update transaction:', error);
        throw error; // Re-throw the error for further handling
    }
    finally {
        // End the session regardless of success or failure
        session.endSession();
    }
});
exports.CertificateManagmentsService = {
    getAllCertificates,
    getSingleCertificate,
    updateStatus,
    //   getSingleCertificate,
    //   deleteCertificate,
    //   deleteMultipleCertificates,
    //   changeCertificateStatus,
};
