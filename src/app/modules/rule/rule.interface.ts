import { Types } from 'mongoose';

export interface IRule {
  ownerId: Types.ObjectId;
  text: string;
  status?: Boolean;
  isDeleted: boolean;
}
