import { Types } from 'mongoose';

export interface IFavourite {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  isFavourite: boolean;
}