"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateManagmentsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const certificate_controller_1 = require("./certificate.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), certificate_controller_1.CertificateManagmentsController.getAllCertificates);
router.get('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), certificate_controller_1.CertificateManagmentsController.getSingleCertificate);
router.patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), certificate_controller_1.CertificateManagmentsController.updateStatus);
exports.CertificateManagmentsRoutes = router;
