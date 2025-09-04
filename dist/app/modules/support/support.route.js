"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportRoutes = void 0;
const express_1 = __importDefault(require("express"));
const support_controller_1 = require("./support.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = express_1.default.Router();
router
    .put('/', (0, auth_1.default)(user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), support_controller_1.SupportController.addSupport)
    .get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.CORPORATE, user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.SUPER_ADMIN), support_controller_1.SupportController.getSupport);
exports.supportRoutes = router;
