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
exports.CertificateManagmentsController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const certificate_service_1 = require("./certificate.service");
const getAllCertificates = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield certificate_service_1.CertificateManagmentsService.getAllCertificates(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Certificates retrieved successfully',
        data: result.result,
        meta: result.meta,
    });
}));
const getSingleCertificate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield certificate_service_1.CertificateManagmentsService.getSingleCertificate(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Certificate retrieved successfully',
        data: result,
    });
}));
const updateStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { verifiedByAdmin } = req.body;
    const result = yield certificate_service_1.CertificateManagmentsService.updateStatus(req.params.id, verifiedByAdmin);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Certificate status updated successfully',
        data: result.updateResult,
    });
}));
exports.CertificateManagmentsController = {
    getAllCertificates,
    getSingleCertificate,
    updateStatus,
    //   deleteCertificate,
    //   deleteMultipleCertificates,
    //   changeCertificateStatus,
};
