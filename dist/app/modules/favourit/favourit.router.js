"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavouritdRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const favourit_controller_1 = require("./favourit.controller");
const router = express_1.default.Router();
// Toggle favourite status (add/remove)
router.post('/:sessionId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), favourit_controller_1.FavouriteCoachController.toggleFavouriteCoach);
// Get all favourite coaches
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), favourit_controller_1.FavouriteCoachController.getFavouriteCoaches);
// Remove specific coach from favourites
router.delete('/:sessionId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT), favourit_controller_1.FavouriteCoachController.removeFavouriteCoach);
exports.FavouritdRouter = router;
