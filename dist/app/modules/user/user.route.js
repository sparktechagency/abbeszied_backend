"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const user_validation_1 = require("./user.validation");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("./user.constants");
const parseData_1 = __importDefault(require("../../middleware/parseData"));
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const upload = (0, fileUpload_1.default)('./public/uploads/profile');
exports.userRoutes = (0, express_1.Router)();
exports.userRoutes
    .post('/create', upload.fields([{ name: 'cerificates', maxCount: 5 }]), (0, parseData_1.default)(), (0, validateRequest_1.default)(user_validation_1.userValidation === null || user_validation_1.userValidation === void 0 ? void 0 : user_validation_1.userValidation.userValidationSchema), user_controller_1.userController.createUser)
    .get('/my-profile', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.CORPORATE, user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), user_controller_1.userController.getMyProfile)
    // .get('/all-users', auth(USER_ROLE.ADMIN), userController.getAllUsers)
    // .get('/all-users-count', userController.getAllUserCount)
    // .get('/all-users-rasio', userController.getAllUserRasio)
    // .get('/:id', userController.getUserById)
    .patch('/update-my-profile', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.CORPORATE, user_constants_1.USER_ROLE.SUPER_ADMIN), upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'introVideo', maxCount: 1 },
]), (0, validateRequest_1.default)(user_validation_1.userValidation === null || user_validation_1.userValidation === void 0 ? void 0 : user_validation_1.userValidation.userupdateValidationSchema), (0, parseData_1.default)(), user_controller_1.userController.updateMyProfile)
    .patch('/switch-status/:businessId', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), user_controller_1.userController.updateOwnerStatus)
    .delete('/delete-my-account', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.CORPORATE, user_constants_1.USER_ROLE.ADMIN), user_controller_1.userController.deleteMyAccount)
    .delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), user_controller_1.userController.blockedUser);
