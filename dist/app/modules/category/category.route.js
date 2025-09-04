"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("./category.controller");
const category_validation_1 = require("./category.validation");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const parseData_1 = __importDefault(require("../../middleware/parseData"));
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const upload = (0, fileUpload_1.default)('./public/uploads/category');
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)(user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), upload.single('image'), (0, parseData_1.default)(), (0, validateRequest_1.default)(category_validation_1.CategoryValidation.createCategoryZodSchema), category_controller_1.CategoryController.createCategory);
router
    .route('/:id')
    .patch((0, auth_1.default)(user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), upload.single('image'), (0, parseData_1.default)(), category_controller_1.CategoryController.updateCategory)
    .delete((0, auth_1.default)(user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), category_controller_1.CategoryController.deleteCategory);
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), category_controller_1.CategoryController.getCategories);
router.get('/client', category_controller_1.CategoryController.getClientCategory);
router.get('/coach', category_controller_1.CategoryController.getCoachCategory);
router.get('/corporate', category_controller_1.CategoryController.getCoachCategory);
router.get('/store', category_controller_1.CategoryController.getStoreCategory);
exports.CategoryRoutes = router;
