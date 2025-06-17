import { model, Schema } from 'mongoose';
import { IApplyJob, IJobPost, JobPostModel } from './jobPost.interface';

const jobPostSchema = new Schema<IJobPost, JobPostModel>(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    jobCategory: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    qualifications: [
      {
        type: String,
        required: true,
      },
    ],
    experience: {
      type: String,
      required: true,
    },
    salary: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
        default: 'QAR',
      },
    },
    benefits: [
      {
        type: String,
        required: true,
      },
    ],
    howToApply: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicationSubmitted: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);
const applyJobSchema = new Schema<IApplyJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobPostId: {
      type: Schema.Types.ObjectId,
      ref: 'JobPost',
      required: true,
    },
    application: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
export const ApplyJob = model<IApplyJob>('ApplyJob', applyJobSchema);
export const JobPost = model<IJobPost, JobPostModel>('JobPost', jobPostSchema);
