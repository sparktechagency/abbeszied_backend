"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const parseData_1 = __importDefault(require("../../middleware/parseData"));
const gallery_controller_1 = require("./gallery.controller");
const upload = (0, fileUpload_1.default)('./public/uploads/gallery');
const galleryRoutes = express_1.default.Router();
// ============= ROUTES =============
// Create - Add image to gallery
galleryRoutes.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), upload.fields([{ name: 'images', maxCount: 5 }]), (0, parseData_1.default)(), gallery_controller_1.GalleryController.addGalleryImages);
// Read - Get user's gallery
galleryRoutes.get('/my-gallery', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), gallery_controller_1.GalleryController.getGallery);
// Read - Get all galleries (admin only)
// galleryRoutes.get(
//   '/all',
//   auth(USER_ROLE.ADMIN),
//   GalleryController.getAllGalleries,
// );
// Update - Update specific image in gallery
galleryRoutes.patch('/image/:imageId', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), upload.fields([{ name: 'images', maxCount: 5 }]), (0, parseData_1.default)(), gallery_controller_1.GalleryController.updateGalleryImage);
// Delete - Delete specific image from gallery
galleryRoutes.delete('/image/:imageId', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), gallery_controller_1.GalleryController.deleteGalleryImage);
// Delete - Delete entire gallery
galleryRoutes.delete('/', (0, auth_1.default)(user_constants_1.USER_ROLE.COACH), gallery_controller_1.GalleryController.deleteEntireGallery);
exports.default = galleryRoutes;
