"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sattings_controller_1 = require("./sattings.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const SettingsRouter = express_1.default.Router();
SettingsRouter.put('/', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), sattings_controller_1.settingsController.addSetting)
    .get('/', sattings_controller_1.settingsController.getSettings)
    .get('/privacy-policy', sattings_controller_1.settingsController.getPrivacyPolicy)
    .get('/account-delete-policy', sattings_controller_1.settingsController.getAccountDelete)
    .get('/support', sattings_controller_1.settingsController.getSupport);
exports.default = SettingsRouter;
