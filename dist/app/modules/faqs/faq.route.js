"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQRoutes = void 0;
const express_1 = require("express");
const faq_controller_1 = require("./faq.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = (0, express_1.Router)();
// Create a new FAQ
router.post('/create', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), faq_controller_1.FAQController.createFAQ);
// Get all FAQs
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), faq_controller_1.FAQController.getAllFAQs);
// Get active FAQs
router.get('/active', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.CORPORATE), faq_controller_1.FAQController.getActiveFAQs);
// Get a single FAQ by ID
router.get('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.CORPORATE), faq_controller_1.FAQController.getFAQById);
// Update a FAQ
router.patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), faq_controller_1.FAQController.updateFAQ);
// Delete a FAQ
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), faq_controller_1.FAQController.deleteFAQ);
exports.FAQRoutes = router;
