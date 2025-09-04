"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPostRoutes = void 0;
const express_1 = __importDefault(require("express"));
const jobPost_controller_1 = require("./jobPost.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const jobPost_validation_1 = require("./jobPost.validation");
const parseData_1 = __importDefault(require("../../middleware/parseData"));
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const router = express_1.default.Router();
const upload = (0, fileUpload_1.default)('./public/uploads/applications');
router
    .route('/create')
    .post((0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CORPORATE), (0, validateRequest_1.default)(jobPost_validation_1.JobPostValidation.createJobPostZodSchema), jobPost_controller_1.JobPostController.createJobPost);
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), jobPost_controller_1.JobPostController.getAllJobPosts);
router.get('/get-my-posts', (0, auth_1.default)(user_constants_1.USER_ROLE.CORPORATE), jobPost_controller_1.JobPostController.getMyJobPosts);
router.post('/apply-job/:id', upload.single('application'), (0, parseData_1.default)(), (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), jobPost_controller_1.JobPostController.applyJob);
router.get('/get-applications/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.CORPORATE), jobPost_controller_1.JobPostController.getApplication);
router
    .route('/:id')
    .get(jobPost_controller_1.JobPostController.getJobPostById)
    .patch((0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CORPORATE), (0, validateRequest_1.default)(jobPost_validation_1.JobPostValidation.updateJobPostZodSchema), jobPost_controller_1.JobPostController.updateJobPost)
    .delete((0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CORPORATE), jobPost_controller_1.JobPostController.deleteJobPost);
exports.JobPostRoutes = router;
