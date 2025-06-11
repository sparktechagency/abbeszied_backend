import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { Gallery } from "./gallery.model";
// ============= UPDATED SERVICE (Using MongoDB ObjectIds) =============
const addToGallery = async (
  userId: string,
  payload: { images: string[] }
) => {
  if (!payload.images || !Array.isArray(payload.images) || payload.images.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'At least one image is required');
  }

  const gallery = await Gallery.findOne({ userId });

  const imageEntries = payload.images.map((img) => ({
    url: img,
    uploadedAt: new Date(),
  }));

  if (gallery) {
    gallery.images.push(...imageEntries);
    await gallery.save();
    return gallery;
  } else {
    const newGallery = new Gallery({
      userId,
      images: imageEntries,
    });
    await newGallery.save();
    return newGallery;
  }
};


const getGallery = async (userId: string) => {
  const gallery = await Gallery.findOne({ userId }).populate('userId', 'name email');
  
  if (!gallery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery not found');
  }
  
  return gallery;
};

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

const updateGalleryImage = async (userId: string, imageId: string, payload: { newImage: string }) => {
  if (!payload.newImage) {
    throw new AppError(httpStatus.BAD_REQUEST, 'New image is required');
  }

  const gallery = await Gallery.findOne({ userId });
  
  if (!gallery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery not found');
  }
  
  // Find the image by ObjectId
  const imageIndex = gallery.images.findIndex(img => img._id?.toString() === imageId);
  
  if (imageIndex === -1) {
    throw new AppError(httpStatus.NOT_FOUND, 'Image not found');
  }
  
  // Update the image URL
gallery.images[imageIndex] = {
  ...gallery.images[imageIndex],
  url: payload.newImage
};
  await gallery.save();
  
  return gallery;
};

const deleteGalleryImage = async (userId: string, imageId: string) => {
  const gallery = await Gallery.findOne({ userId });
  
  if (!gallery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery not found');
  }
  
  // Find and remove the image by ObjectId
  const imageIndex = gallery.images.findIndex(img => img._id?.toString() === imageId);
  
  if (imageIndex === -1) {
    throw new AppError(httpStatus.NOT_FOUND, 'Image not found');
  }
  
  gallery.images.splice(imageIndex, 1);
  
  // If no images left, delete the entire gallery
  if (gallery.images.length === 0) {
    await Gallery.findByIdAndDelete(gallery._id);
    return { message: 'Gallery deleted as no images remain' };
  }
  
  await gallery.save();
  return gallery;
};

const deleteEntireGallery = async (userId: string) => {
  const gallery = await Gallery.findOneAndDelete({ userId });
  
  if (!gallery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery not found');
  }
  
  return gallery;
};

export const GalleryService = {
  addToGallery,
  getGallery,
  // getAllGalleries,
  updateGalleryImage,
  deleteGalleryImage,
  deleteEntireGallery,
};
