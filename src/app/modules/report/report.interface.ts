import { Types } from 'mongoose';

export type IReport = {
  reporterId: Types.ObjectId;
  produtId: Types.ObjectId;
  image: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
};
