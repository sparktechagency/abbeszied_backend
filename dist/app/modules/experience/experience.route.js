"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const experience_controller_1 = require("./experience.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const experience_validation_1 = require("./experience.validation");
const upload = (0, fileUpload_1.default)('./public/uploads/certificates');
const experienceRoutes = express_1.default.Router();
// Work History Routes
experienceRoutes
    .post('/work-history', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), (0, validateRequest_1.default)(experience_validation_1.experienceValidation.workHistoryValidationSchema), experience_controller_1.experienceController.addWorkHistory)
    .patch('/work-history/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), experience_controller_1.experienceController.updateWorkHistory)
    .delete('/work-history/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), experience_controller_1.experienceController.deleteWorkHistory)
    .get('/work-history', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), experience_controller_1.experienceController.getUserWorkHistory);
// Certificate Routes
experienceRoutes
    .post('/certificate', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), upload.fields([{ name: 'certificateFile', maxCount: 1 }]), (0, validateRequest_1.default)(experience_validation_1.experienceValidation.certificateValidationSchema), experience_controller_1.experienceController.addCertificate)
    .patch('/certificate/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), upload.fields([{ name: 'certificateFile', maxCount: 1 }]), experience_controller_1.experienceController.updateCertificate)
    .delete('/certificate/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), experience_controller_1.experienceController.deleteCertificate)
    .get('/certificate', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), experience_controller_1.experienceController.getUserCertificates);
exports.default = experienceRoutes;
