import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import { GalleryController } from './gallery.controller';
const upload = fileUpload('./public/uploads/gallery');
const galleryRoutes = express.Router();

// ============= ROUTES =============

// Create - Add image to gallery
galleryRoutes.post(
  '/',
  auth(USER_ROLE.COACH),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  parseData(),
  GalleryController.addGalleryImages,
);

// Read - Get user's gallery
galleryRoutes.get(
  '/my-gallery',
  auth(USER_ROLE.COACH),
  GalleryController.getGallery,
);

// Read - Get all galleries (admin only)
// galleryRoutes.get(
//   '/all',
//   auth(USER_ROLE.ADMIN),
//   GalleryController.getAllGalleries,
// );

// Update - Update specific image in gallery
galleryRoutes.patch(
  '/image/:imageId',
  auth(USER_ROLE.COACH),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  parseData(),
  GalleryController.updateGalleryImage,
);

// Delete - Delete specific image from gallery
galleryRoutes.delete(
  '/image/:imageId',
  auth(USER_ROLE.COACH),
  GalleryController.deleteGalleryImage,
);

// Delete - Delete entire gallery
galleryRoutes.delete(
  '/',
  auth(USER_ROLE.COACH),
  GalleryController.deleteEntireGallery,
);

export default galleryRoutes;
