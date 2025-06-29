import { IFAQ } from './faq.interface';
import { FAQ } from './faq.model';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const createFAQToDB = async (payload: IFAQ) => {
  const result = await FAQ.create(payload);
  if (!result) {
    throw new AppError(httpStatus.CREATED, 'Failed to create FAQ');
  }
  return result;
};
const getFAQById = async (id: string) => {
  const result = await FAQ.findById(id);
  if (!result) {
    throw new AppError(httpStatus.OK, 'FAQ not found');
  }
  return result;
};

const updateFAQToDB = async (id: string, payload: Partial<IFAQ>) => {
  const existingFAQ = await FAQ.findById(id);
  if (!existingFAQ) {
    throw new AppError(httpStatus.NOT_FOUND, 'FAQ not found');
  }

  const result = await FAQ.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const getAllFAQsFromDB = async (query: Record<string, any>) => {
  const faqQuery = await new QueryBuilder(FAQ.find(), query)
    .search(['question', 'answer'])
    .filter()
    .paginate()
    .sort()
    .fields();
  const meta = await faqQuery.countTotal();
  const result = await faqQuery.modelQuery;

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to get FAQs');
  }
  return { result, meta };
};

const getActiveFAQsFromDB = async () => {
  const result = await FAQ.find({ isActive: true });
  return result;
};

const deleteFAQFromDB = async (id: string) => {
  const result = await FAQ.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'This FAQ is not found');
  }
  return result;
};

export const FAQService = {
  createFAQToDB,
  getFAQById,
  updateFAQToDB,
  getAllFAQsFromDB,
  getActiveFAQsFromDB,
  deleteFAQFromDB,
};
