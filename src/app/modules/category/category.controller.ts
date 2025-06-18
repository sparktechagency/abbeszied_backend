import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { updateFileName } from '../../utils/fileHelper';
import catchAsync from '../../utils/catchAsync';

const createCategory = catchAsync(async (req, res) => {
  if (req?.file) {
    req.body.image = updateFileName('category', req?.file?.filename);
  }
  const result = await CategoryService.createCategoryToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category create successfully',
    data: result,
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoriesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category retrieved successfully',
    data: result.categories,
    meta: result.meta,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updateCategoryData = req.body;
  const result = await CategoryService.updateCategoryToDB(
    id,
    updateCategoryData,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await CategoryService.deleteCategoryToDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category delete successfully',
    data: result,
  });
});
const getClientCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getClientCategory();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category retrieved successfully',
    data: result,
  });
});
const getCoachCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCoachCategory();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category retrieved successfully',
    data: result,
  });
});
export const CategoryController = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getClientCategory,
  getCoachCategory,
};
