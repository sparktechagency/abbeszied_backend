import { Types } from 'mongoose';

export interface IFavouriteJobs {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  isFavourite: boolean;
}
