"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductManagmentsRouter = void 0;
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("./product.controller");
const user_constants_1 = require("../user/user.constants");
const auth_1 = __importDefault(require("../../middleware/auth"));
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), product_controller_1.DashboardProductController.getAllProducts);
router.patch('/status-change/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), product_controller_1.DashboardProductController.changeProductStatus);
router.get('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), product_controller_1.DashboardProductController.getSingleProduct);
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), product_controller_1.DashboardProductController.deleteProduct);
router.post('/delete-multiple', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), product_controller_1.DashboardProductController.deleteMultipleProducts);
exports.ProductManagmentsRouter = router;
