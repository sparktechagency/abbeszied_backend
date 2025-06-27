import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import Product from '../store/store.model';

const getAllProductsFromDb = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Product.find({ isApproved: { $in: ['approved', 'pending'] } }).populate(
      'sellerId',
      'fullName',
    ),
    query,
  );
  const products = await queryBuilder
    .search(['name', 'category', 'location'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();
  const meta = await queryBuilder.countTotal();
  return { products, meta };
};

const getSingleProductFromDb = async (id: string) => {
  const result = await Product.findById(id).populate(
    'sellerId',
    'fullName images phone',
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return result;
};

const deleteProductFromDb = async (id: string) => {
  const result = await Product.findByIdAndDelete(id);
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  return result;
};
const deleteMultipleProductFromDb = async (productIds: string[]) => {
  const result = await Product.deleteMany({
    _id: { $in: productIds },
  });

  if (result.deletedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Products not found');
  }

  return result;
};

const changeProductStatusFromDb = async (id: string, status: string) => {
  const result = await Product.findByIdAndUpdate(
    id,
    { isApproved: status },
    { new: true },
  );
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  return result;
};


export const DashboardProductService = {
  getAllProductsFromDb,
  getSingleProductFromDb,
  deleteProductFromDb,
  deleteMultipleProductFromDb,
  changeProductStatusFromDb
};
