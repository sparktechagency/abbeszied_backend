import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { GalleryService } from './gallery.service';
import { updateFileName } from '../../utils/fileHelper';
import { Request } from 'express';
import { FilesObject } from '../../interface/common.interface';

// ============= CONTROLLER =============
const addGalleryImages = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { body, files } = req as Request & { files: FilesObject };

  const images = files.images?.map((photo) =>
    updateFileName('gallery', photo.filename),
  );

  body.images = images; // array of filenames

  const result = await GalleryService.addToGallery(userId, body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Images added to gallery successfully',
    data: result,
  });
});

const getGallery = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await GalleryService.getGallery(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gallery retrieved successfully',
    data: result,
  });
});

// const getAllGalleries = catchAsync(async (req, res) => {
//   const result = await GalleryService.getAllGalleries(req.query);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'All galleries retrieved successfully',
//     data: result,
//   });
// });

const updateGalleryImage = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { imageId } = req.params;

  if (req?.file) {
    req.body.newImage = updateFileName('profile', req?.file?.filename);
  }

  const result = await GalleryService.updateGalleryImage(
    userId,
    imageId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Image updated successfully',
    data: result,
  });
});

const deleteGalleryImage = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { imageId } = req.params;

  const result = await GalleryService.deleteGalleryImage(userId, imageId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Image deleted successfully',
    data: result,
  });
});

const deleteEntireGallery = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await GalleryService.deleteEntireGallery(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gallery deleted successfully',
    data: result,
  });
});

export const GalleryController = {
  addGalleryImages,
  getGallery,
  // getAllGalleries,
  updateGalleryImage,
  deleteGalleryImage,
  deleteEntireGallery,
};
