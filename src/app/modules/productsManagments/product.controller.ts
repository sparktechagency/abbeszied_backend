import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DashboardProductService } from './product.service';

const getAllProducts = catchAsync(async (req, res) => {
  const result = await DashboardProductService.getAllProductsFromDb(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Products retrieved successfully.',
    data: result.products,
    meta: result.meta,
  });
});
const getSingleProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DashboardProductService.getSingleProductFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product retrieved successfully.',
    data: result,
  });
});
const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DashboardProductService.deleteProductFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product deleted successfully.',
    data: result,
  });
});
const deleteMultipleProducts = catchAsync(async (req, res) => {
  const { productIds } = req.body;
  const result =
    await DashboardProductService.deleteMultipleProductFromDb(productIds);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Products deleted successfully.',
    data: result,
  });
});
const changeProductStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  const result = await DashboardProductService.changeProductStatusFromDb(id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Status update successfully',
    data: result,
  });
});
export const DashboardProductController = {
  getAllProducts,
  getSingleProduct,
  deleteProduct,
  deleteMultipleProducts,
  changeProductStatus,
};
