"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const banner_controller_1 = require("./banner.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const parseData_1 = __importDefault(require("../../middleware/parseData"));
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const upload = (0, fileUpload_1.default)('./public/uploads/banners');
const router = express_1.default.Router();
router
    .route('/')
    .post((0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), upload.single('image'), (0, parseData_1.default)(), banner_controller_1.BannerController.createBanner)
    .get((0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), banner_controller_1.BannerController.getAllBanner);
router.get('/client', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), banner_controller_1.BannerController.getClientBanner);
router.get('/coach', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), banner_controller_1.BannerController.getCoachBanner);
router.get('/corporate', (0, auth_1.default)(user_constants_1.USER_ROLE.CORPORATE), banner_controller_1.BannerController.getCorporateBanner);
router.get('/client-store', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), banner_controller_1.BannerController.getClientStoreBanner);
router.get('/coach-store', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), banner_controller_1.BannerController.getCoachStoreBanner);
router
    .route('/:id')
    .patch((0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), upload.single('image'), (0, parseData_1.default)(), banner_controller_1.BannerController.updateBanner)
    .delete((0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), banner_controller_1.BannerController.deleteBanner);
exports.BannerRoutes = router;
