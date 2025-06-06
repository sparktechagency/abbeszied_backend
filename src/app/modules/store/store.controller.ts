import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProductsService } from './store.service';
import { Request } from 'express';
import { FilesObject } from '../../interface/common.interface';
import { updateFileName } from '../../utils/fileHelper';

const addProduct = catchAsync(async (req, res) => {
  const { body, files } = req as Request & { files: FilesObject };
  const { userId }: any = req.user;

  const images = files.images?.map((photo) =>
    updateFileName('images', photo.filename),
  );
  body.images = images;
  const result = await ProductsService.addProduct(body, userId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Product added successfully.',
    data: result,
  });
});
// get all products
const getAllProducts = catchAsync(async (req, res) => {
  const result = await ProductsService.getProduct(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product retrieved successfully.',
    data: result,
  });
});
const getMyProducts = catchAsync(async (req, res) => {
  const { userId }: any = req.user;
  const result = await ProductsService.getMyProduct(req.query, userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product retrieved successfully.',
    data: result,
  });
});
const getProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProductsService.getSingleProduct(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product retrieved successfully.',
    data: result,
  });
});
const markSold = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId }: any = req.user;
  const result = await ProductsService.markAsSold(id, userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product mark as sold successfully.',
    data: result,
  });
});
const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId }: any = req.user;
  const result = await ProductsService.deleteProduct(id, userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product delete successfully.',
    data: result,
  });
});
const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { body, files } = req as Request & { files: FilesObject };
  const { userId }: any = req.user;

  const images = files.images?.map((photo) =>
    updateFileName('images', photo.filename),
  );
  body.images = images;
  const result = await ProductsService.updateProduct(id, userId, body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product update successfully.',
    data: result,
  });
});
export const Productcontroller = {
  addProduct,
  getAllProducts,
  getProduct,
  getMyProducts,
  markSold,
  deleteProduct,
  updateProduct,
};
