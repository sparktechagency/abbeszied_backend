import { IProduct } from './store.interface';
import Product from './store.model';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const addProduct = async (payload: IProduct, sellerId: string) => {
  // Add seller id to product
  const data = {
    ...payload,
    price: Number(payload.price),
    sellerId,
  };
  // save to DB
  const result = await Product.create(data);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product creation failed');
  }
  return result;
};
const getProduct = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Product.find({ isApproved: 'approved', isDeleted: false }),
    query,
  );
  // Fetch all products based on query filters, sorting, pagination, etc.
  const products = await queryBuilder
    .search(['location', 'name', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .priceRange()
    .modelQuery.exec();
  const meta = await queryBuilder.countTotal();

  return { products, meta };
};

const getMyProduct = async (query: Record<string, unknown>, userId: string) => {
  const queryBuilder = new QueryBuilder(
    Product.find({ sellerId: userId }),
    query,
  );
  const products = await queryBuilder
    .search(['location', 'name', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .priceRange()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();
  return { products, meta };
};

const getSingleProduct = async (id: string) => {
  // Use findById() to fetch the product and populate the seller and buyer fields
  const product = await Product.findById(id)
    .select(
      'name price category description location condition images status sellerId buyerId',
    ) // Field selection
    .populate([
      { path: 'sellerId', select: 'fullName email phone createdAt image' },
      { path: 'buyerId', select: 'fullName email phone createdAt image' },
    ]);

  // Handle case where product doesn't exist
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product;
};

const markAsSold = async (id: string, sellerId: string) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (product.status === 'sold') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product is already sold');
  }
  if (product.sellerId.toString() !== sellerId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
  }
  product.status = 'sold';
  const result = await product.save();
  return result;
};

const deleteProduct = async (id: string, userId: string) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (product.sellerId.toString() !== userId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
  }
  const result = await Product.findByIdAndDelete(id);
  return result;
};

const updateProduct = async (
  id: string,
  userId: string,
  payload: Partial<IProduct>,
) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (product.sellerId.toString() !== userId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
  }
  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  return result;
};
export const ProductsService = {
  addProduct,
  getProduct,
  getSingleProduct,
  getMyProduct,
  markAsSold,
  deleteProduct,
  updateProduct,
};
