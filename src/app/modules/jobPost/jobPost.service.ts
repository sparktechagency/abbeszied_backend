import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IJobPost } from './jobPost.interface';
import { ApplyJob, JobPost } from './jobPost.model';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { FavouriteJob } from '../favourit jobs/favouritJobs.model';
import { sendNotifications } from '../../helpers/sendNotification';
import { User } from '../user/user.models';
const checkIsFavourite = async (jobId: string, userId: string) => {
  const favouriteRecord = await FavouriteJob.findOne({ userId, jobId });
  const isFavourite = !!favouriteRecord;
  return isFavourite;
};
const createJobPostToDB = async (payload: IJobPost): Promise<IJobPost> => {
  // Verify user exists
  const user = await User.findById(payload.postedBy);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await JobPost.create(payload);

  try {
    await User.findByIdAndUpdate(payload.postedBy, {
      $inc: { jobPostCount: 1 },
    });
  } catch (error) {
    console.error('Failed to update job post count:', error);
  }

  return result;
};

const getAllJobPostsFromDB = async (
  query: Record<string, unknown>,
  userId: string,
) => {
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
  // 8. Process sessions with additional data (favorite and rating)
  const recommended = await Promise.all(
    result.map(async (jobs: any) => {
      const isFavorite = await checkIsFavourite(jobs._id, userId);
      return {
        ...jobs.toObject(),
        isFavorite,
      };
    }),
  );

  return {
    meta,
    result: recommended,
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
  await JobPost.findByIdAndUpdate(jobPostId, {
    $inc: { applicationSubmitted: 1 },
  });
  const client = await User.findById(userId);
  const jobPost = await JobPost.findById(jobPostId);
  await sendNotifications({
    receiver: jobPost?.postedBy,
    type: 'APPLICATION',
    message: `You have a new application from ${client?.fullName}`,
  });
  return result;
};
const getApplication = async (id: string, query: Record<string, unknown>) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid job post ID');
  }
  const queryBuilder = new QueryBuilder(
    ApplyJob.find({ jobPostId: id })
      .populate('userId', 'fullName email phone image verifiedBadge')
      .populate('jobPostId', 'jobCategory'),
    query,
  );
  const result = await queryBuilder
    .fields()
    .filter()
    .paginate()
    .sort()
    .modelQuery.exec();
  const meta = await queryBuilder.countTotal();
  return {
    meta,
    result,
  };
};
export const JobPostService = {
  createJobPostToDB,
  getAllJobPostsFromDB,
  getJobPostByIdFromDB,
  updateJobPostToDB,
  deleteJobPostFromDB,
  getMyJobPosts,
  applyJob,
  getApplication,
};
