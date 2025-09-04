"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavouritdJobRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const favouritJobs_controller_1 = require("./favouritJobs.controller");
const router = express_1.default.Router();
// Toggle favourite status (add/remove)
router.post('/:jobId', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), favouritJobs_controller_1.FavouriteJobController.toggleFavouriteJob);
// Get all favourite jobs
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), favouritJobs_controller_1.FavouriteJobController.getFavouriteJobs);
// Remove specific coach from favourites
router.delete('/:jobId', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), favouritJobs_controller_1.FavouriteJobController.removeFavouriteJob);
exports.FavouritdJobRouter = router;
