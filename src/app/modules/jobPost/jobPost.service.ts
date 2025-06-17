import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IJobPost } from './jobPost.interface';
import { ApplyJob, JobPost } from './jobPost.model';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';

const createJobPostToDB = async (payload: IJobPost): Promise<IJobPost> => {
  const result = await JobPost.create(payload);
  return result;
};

const getAllJobPostsFromDB = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    JobPost.find().populate('postedBy'),
    query,
  )
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
const getMyJobPosts = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    JobPost.find({ postedBy: userId }).populate('postedBy'),
    query,
  )
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

const getJobPostByIdFromDB = async (id: string): Promise<IJobPost | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid job post ID');
  }

  const result = await JobPost.findById(id).populate('postedBy');
  return result;
};

const updateJobPostToDB = async (
  id: string,
  payload: Partial<IJobPost>,
): Promise<IJobPost | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid job post ID');
  }

  const result = await JobPost.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  }).populate('postedBy');
  return result;
};

const deleteJobPostFromDB = async (id: string): Promise<IJobPost | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid job post ID');
  }

  const result = await JobPost.findByIdAndDelete(id);
  return result;
};
const applyJob = async (
  userId: string,
  jobPostId: string,
  application: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid user ID');
  }
  if (!mongoose.Types.ObjectId.isValid(jobPostId)) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid job post ID');
  }
  const result = await ApplyJob.create({
    userId,
    jobPostId,
    application,
  });
  return result;
};
export const JobPostService = {
  createJobPostToDB,
  getAllJobPostsFromDB,
  getJobPostByIdFromDB,
  updateJobPostToDB,
  deleteJobPostFromDB,
  getMyJobPosts,
  applyJob,
};
