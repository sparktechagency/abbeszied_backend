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
exports.GalleryService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const gallery_model_1 = require("./gallery.model");
// ============= UPDATED SERVICE (Using MongoDB ObjectIds) =============
const addToGallery = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.images || !Array.isArray(payload.images) || payload.images.length === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'At least one image is required');
    }
    const gallery = yield gallery_model_1.Gallery.findOne({ userId });
    const imageEntries = payload.images.map((img) => ({
        url: img,
        uploadedAt: new Date(),
    }));
    if (gallery) {
        gallery.images.push(...imageEntries);
        yield gallery.save();
        return gallery;
    }
    else {
        const newGallery = new gallery_model_1.Gallery({
            userId,
            images: imageEntries,
        });
        yield newGallery.save();
        return newGallery;
    }
});
const getGallery = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const gallery = yield gallery_model_1.Gallery.findOne({ userId }).populate('userId', 'name email');
    if (!gallery) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Gallery not found');
    }
    return gallery;
});
// const getAllGalleries = async (query: any) => {
//   const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
//   const skip = (Number(page) - 1) * Number(limit);
//   const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
//   const galleries = await Gallery.find({})
//     .populate('userId', 'name email')
//     .sort(sort)
//     .skip(skip)
//     .limit(Number(limit));
//   const total = await Gallery.countDocuments({});
//   return {
//     data: galleries,
//     pagination: {
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       totalPages: Math.ceil(total / Number(limit)),
//     },
//   };
// };
const updateGalleryImage = (userId, imageId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.newImage) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'New image is required');
    }
    const gallery = yield gallery_model_1.Gallery.findOne({ userId });
    if (!gallery) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Gallery not found');
    }
    // Find the image by ObjectId
    const imageIndex = gallery.images.findIndex(img => { var _a; return ((_a = img._id) === null || _a === void 0 ? void 0 : _a.toString()) === imageId; });
    if (imageIndex === -1) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Image not found');
    }
    // Update the image URL
    gallery.images[imageIndex] = Object.assign(Object.assign({}, gallery.images[imageIndex]), { url: payload.newImage });
    yield gallery.save();
    return gallery;
});
const deleteGalleryImage = (userId, imageId) => __awaiter(void 0, void 0, void 0, function* () {
    const gallery = yield gallery_model_1.Gallery.findOne({ userId });
    if (!gallery) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Gallery not found');
    }
    // Find and remove the image by ObjectId
    const imageIndex = gallery.images.findIndex(img => { var _a; return ((_a = img._id) === null || _a === void 0 ? void 0 : _a.toString()) === imageId; });
    if (imageIndex === -1) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Image not found');
    }
    gallery.images.splice(imageIndex, 1);
    // If no images left, delete the entire gallery
    if (gallery.images.length === 0) {
        yield gallery_model_1.Gallery.findByIdAndDelete(gallery._id);
        return { message: 'Gallery deleted as no images remain' };
    }
    yield gallery.save();
    return gallery;
});
const deleteEntireGallery = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const gallery = yield gallery_model_1.Gallery.findOneAndDelete({ userId });
    if (!gallery) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Gallery not found');
    }
    return gallery;
});
exports.GalleryService = {
    addToGallery,
    getGallery,
    // getAllGalleries,
    updateGalleryImage,
    deleteGalleryImage,
    deleteEntireGallery,
};
