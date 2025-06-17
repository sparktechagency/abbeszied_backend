import { Schema } from 'mongoose';
import { Model } from 'mongoose';

export type IJobPost = {
  jobTitle: string;
  location: string;
  jobCategory: string;
  jobType: string;
  jobDescription: string;
  qualifications: string[];
  experience: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  benefits: string[];
  howToApply: string;
  deadline: Date;
  isActive: boolean;
  postedBy: Schema.Types.ObjectId; // Reference to User model
};
export interface IApplyJob extends IJobPost {
  userId: Schema.Types.ObjectId; // Reference to User model
  jobPostId: Schema.Types.ObjectId; // Reference to JobPost model
  application: string;
}

export type JobPostModel = Model<IJobPost>;
