"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripeAccount_controller_1 = require("./stripeAccount.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
// import { auth } from "../../middlewares/auth.js";
const stripeAccountRoutes = express_1.default.Router();
stripeAccountRoutes
    .post('/create-connected-account', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), stripeAccount_controller_1.stripeAccountController.createStripeAccount)
    .get('/success-account/:id', stripeAccount_controller_1.stripeAccountController.successPageAccount)
    .get('/refreshAccountConnect/:id', stripeAccount_controller_1.stripeAccountController.refreshAccountConnect);
exports.default = stripeAccountRoutes;
