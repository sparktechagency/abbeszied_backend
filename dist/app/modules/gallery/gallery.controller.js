"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const gallery_service_1 = require("./gallery.service");
const fileHelper_1 = require("../../utils/fileHelper");
// ============= CONTROLLER =============
const addGalleryImages = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.user;
    const { body, files } = req;
    const images = (_a = files.images) === null || _a === void 0 ? void 0 : _a.map((photo) => (0, fileHelper_1.updateFileName)('gallery', photo.filename));
    body.images = images; // array of filenames
    const result = yield gallery_service_1.GalleryService.addToGallery(userId, body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Images added to gallery successfully',
        data: result,
    });
}));
const getGallery = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield gallery_service_1.GalleryService.getGallery(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Gallery retrieved successfully',
        data: result,
    });
}));
// const getAllGalleries = catchAsync(async (req, res) => {
//   const result = await GalleryService.getAllGalleries(req.query);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'All galleries retrieved successfully',
//     data: result,
//   });
// });
const updateGalleryImage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.user;
    const { imageId } = req.params;
    if (req === null || req === void 0 ? void 0 : req.file) {
        req.body.newImage = (0, fileHelper_1.updateFileName)('profile', (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename);
    }
    const result = yield gallery_service_1.GalleryService.updateGalleryImage(userId, imageId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Image updated successfully',
        data: result,
    });
}));
const deleteGalleryImage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { imageId } = req.params;
    const result = yield gallery_service_1.GalleryService.deleteGalleryImage(userId, imageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Image deleted successfully',
        data: result,
    });
}));
const deleteEntireGallery = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield gallery_service_1.GalleryService.deleteEntireGallery(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Gallery deleted successfully',
        data: result,
    });
}));
exports.GalleryController = {
    addGalleryImages,
    getGallery,
    // getAllGalleries,
    updateGalleryImage,
    deleteGalleryImage,
    deleteEntireGallery,
};
