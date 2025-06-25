import { ICategory } from './category.interface';
import { Category } from './category.model';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const createCategoryToDB = async (payload: ICategory) => {
  const { name, image, type } = payload;
  const isExistName = await Category.findOne({ name: name });
  if (isExistName) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Category already exist');
  }
  const createCategory: any = await Category.create({
    name,
    image,
    type,
  });

  return createCategory;
};

const getCategoriesFromDB = async (query: Record<string, unknown>) => {
  // Step 1: Build the categories query with QueryBuilder
  const queryBuilder = new QueryBuilder(Category.find({}), query);

  // Execute chained query features: sort, paginate, select fields, filter, search
  const categories = await queryBuilder
    .sort()
    .paginate()
    .fields()
    .filter()
    .search([]).modelQuery;

  // Get pagination/meta info
  const meta = await queryBuilder.countTotal();

  // Return the meta info and updated categories array
  return {
    meta,
    categories,
  };
};

const updateCategoryToDB = async (id: string, payload: ICategory) => {
  const isExistCategory: any = await Category.findById(id);

  if (!isExistCategory) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category doesn't exist");
  }

  const updateCategory = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateCategory;
};

const deleteCategoryToDB = async (id: string): Promise<ICategory | null> => {
  const deleteCategory = await Category.findByIdAndDelete(id);
  if (!deleteCategory) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category doesn't exist");
  }
  return deleteCategory;
};
const getClientCategory = async () => {
  const result = await Category.find({ type: 'client' });
  return result;
};
const getCoachCategory = async () => {
  const result = await Category.find({ type: 'coach' });
  return result;
};
const getStoreCategory = async () => {
  const result = await Category.find({ type: 'store' });
  return result;
};
export const CategoryService = {
  createCategoryToDB,
  getCategoriesFromDB,
  updateCategoryToDB,
  deleteCategoryToDB,
  getClientCategory,
  getCoachCategory,
  getStoreCategory
};
