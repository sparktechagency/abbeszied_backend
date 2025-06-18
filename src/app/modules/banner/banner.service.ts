import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IBanner } from './banner.interface';
import { Banner } from './banner.model';
import mongoose from 'mongoose';
import { USER_ROLE } from '../user/user.constants';
import QueryBuilder from '../../builder/QueryBuilder';

const createBannerToDB = async (payload: IBanner): Promise<IBanner> => {
  const createBanner: any = await Banner.create(payload);

  return createBanner;
};

const getAllBannerFromDB = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Banner.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await queryBuilder.modelQuery.exec();
  const meta = await queryBuilder.countTotal();
  return {
    meta,
    result,
  };
};

const getClientAllBannerFromDB = async (): Promise<IBanner[]> => {
  return await Banner.find({ type: 'client' });
};
const getCorporateAllBannerFromDB = async (): Promise<IBanner[]> => {
  return await Banner.find({ type: 'corporate' });
};
const getCoachAllBannerFromDB = async (): Promise<IBanner[]> => {
  return await Banner.find({ type: 'coach' });
};
const getClientStoreAllBannerFromDB = async (): Promise<IBanner[]> => {
  return await Banner.find({ type: 'clientStore' });
};
const getCoachStoreAllBannerFromDB = async (): Promise<IBanner[]> => {
  return await Banner.find({ type: 'coachStore' });
};

const updateBannerToDB = async (
  id: string,
  payload: IBanner,
): Promise<IBanner | {}> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid ');
  }

  const banner: any = await Banner.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return banner;
};

const deleteBannerToDB = async (id: string): Promise<IBanner | undefined> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid ');
  }

  //delete from database
  await Banner.findByIdAndDelete(id);
  return;
};

export const BannerService = {
  createBannerToDB,
  getAllBannerFromDB,
  updateBannerToDB,
  deleteBannerToDB,
  getClientAllBannerFromDB,
  getCorporateAllBannerFromDB,
  getCoachAllBannerFromDB,
  getClientStoreAllBannerFromDB,
  getCoachStoreAllBannerFromDB,
};
