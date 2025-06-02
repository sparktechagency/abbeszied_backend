import { Types } from 'mongoose';

export type TFavourite = {
  userId: Types.ObjectId;
  parkingId: Types.ObjectId;
};
