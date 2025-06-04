import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { ICertificate, IWorkHistory } from './experience.interface';
import { Certificate, WorkHistory } from './experience.models';
import { User } from '../user/user.models';

const addWorkHistory = async (payload: IWorkHistory) => {
  const user = await User.IsUserExistById(payload.userId.toString());
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await WorkHistory.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Work history creating failed');
  }
  return result;
};

const updateWorkHistory = async (
  id: string,
  payload: Partial<IWorkHistory>,
) => {
  const exists = await WorkHistory.findById(id);
  if (!exists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Work history not found');
  }

  const result = await WorkHistory.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteWorkHistory = async (id: string, userId: string) => {
  const exists = await WorkHistory.findOne({ _id: id, userId });
  if (!exists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Work history not found');
  }

  const result = await WorkHistory.findByIdAndDelete(id);
  return result;
};

const getUserWorkHistory = async (userId: string) => {
  const result = await WorkHistory.find({ userId });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Work history not found');
  }
  return result;
};

const addCertificate = async (payload: ICertificate) => {
  const user = await User.IsUserExistById(payload.userId.toString());
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await Certificate.create(payload);
  return result;
};

const updateCertificate = async (
  id: string,
  payload: Partial<ICertificate>,
) => {
  const exists = await Certificate.findById(id);
  if (!exists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Certificate not found');
  }

  const result = await Certificate.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteCertificate = async (id: string, userId: string) => {
  const exists = await Certificate.findOne({ _id: id, userId });
  if (!exists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Certificate not found');
  }

  const result = await Certificate.findByIdAndDelete(id);
  return result;
};

const getUserCertificates = async (userId: string) => {
  const result = await Certificate.find({ userId });
  return result;
};

export const experienceService = {
  addWorkHistory,
  updateWorkHistory,
  deleteWorkHistory,
  getUserWorkHistory,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  getUserCertificates,
};
