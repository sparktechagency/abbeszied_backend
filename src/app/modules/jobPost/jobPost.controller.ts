import { Request, Response } from 'express';
import { JobPostService } from './jobPost.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { updateFileName } from '../../utils/fileHelper';

const createJobPost = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await JobPostService.createJobPostToDB({
    ...req.body,
    postedBy: userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Job post created successfully',
    data: result,
  });
});

const getAllJobPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await JobPostService.getAllJobPostsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job posts retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});
const getMyJobPosts = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await JobPostService.getMyJobPosts(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job posts retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getJobPostById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobPostService.getJobPostByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job post retrieved successfully',
    data: result,
  });
});

const updateJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobPostService.updateJobPostToDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job post updated successfully',
    data: result,
  });
});

const deleteJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobPostService.deleteJobPostFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job post deleted successfully',
    data: result,
  });
});
const applyJob = catchAsync(async (req, res) => {
  console.log('req.file', req.file);
  if (req?.file) {
    req.body.application = updateFileName('applications', req?.file?.filename);
  }
  const { id } = req.params;
  const { userId } = req.user;
  const result = await JobPostService.applyJob(
    id,
    userId,
    req.body.application,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job applyed successfully',
    data: result,
  });
});

export const JobPostController = {
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  getMyJobPosts,
  applyJob,
};
