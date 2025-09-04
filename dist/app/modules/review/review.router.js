"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("./review.controller");
const review_validation_1 = require("./review.validation");
const auth_1 = __importDefault(require("../../middleware/auth"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const user_constants_1 = require("../user/user.constants");
const router = express_1.default.Router();
router.get('/analysis', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), review_controller_1.ReviewController.getAnalysis);
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), review_controller_1.ReviewController.getAllReview);
router.post('/create', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.reviewZodSchema), review_controller_1.ReviewController.createReview);
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), review_controller_1.ReviewController.removeReview);
exports.reviewRoutes = router;
