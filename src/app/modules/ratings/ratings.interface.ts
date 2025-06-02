import { Types } from 'mongoose';

export type TReview = {
  userId: Types.ObjectId;
  parkingId?: Types.ObjectId;
  rating?: number;
  review: string;
  type: 'field' | 'admin';
};
