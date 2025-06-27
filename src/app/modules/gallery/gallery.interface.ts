import { Types } from 'mongoose';

export interface IGallery {
  userId: Types.ObjectId;
  images: string[];
}
