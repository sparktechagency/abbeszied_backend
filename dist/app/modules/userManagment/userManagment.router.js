"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagmentsRouter = void 0;
const express_1 = __importDefault(require("express"));
const userManagment_controller_1 = require("./userManagment.controller");
const userManagment_validation_1 = require("./userManagment.validation");
const user_constants_1 = require("../user/user.constants");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), userManagment_controller_1.DashboardUserController.getAllUser);
router.get('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), userManagment_controller_1.DashboardUserController.getSingleUser);
router.patch('/status/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), (0, validateRequest_1.default)(userManagment_validation_1.userManagmentValidations.updateStatus), userManagment_controller_1.DashboardUserController.updateStatus);
exports.UserManagmentsRouter = router;
