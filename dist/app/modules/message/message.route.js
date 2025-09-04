"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("./message.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const parseData_1 = __importDefault(require("../../middleware/parseData"));
const upload = (0, fileUpload_1.default)('./public/uploads/images');
const router = express_1.default.Router();
// Existing routes
router.post('/send-message/:chatId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), upload.fields([{ name: 'image', maxCount: 5 }]), (0, parseData_1.default)(), message_controller_1.MessageController.sendMessage);
router.get('/:chatId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), message_controller_1.MessageController.getMessages);
router.post('/react/:messageId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), message_controller_1.MessageController.addReaction);
router.delete('/delete/:messageId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), message_controller_1.MessageController.deleteMessage);
// New route for pin/unpin message
router.patch('/pin-unpin/:messageId', (0, auth_1.default)(user_constants_1.USER_ROLE.CLIENT, user_constants_1.USER_ROLE.COACH, user_constants_1.USER_ROLE.SUPER_ADMIN, user_constants_1.USER_ROLE.ADMIN), message_controller_1.MessageController.pinUnpinMessage);
exports.messageRoutes = router;
