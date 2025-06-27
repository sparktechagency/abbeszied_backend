import { Model, Types } from 'mongoose';

export interface IWorkHistory {
  companyName: string;
  designation: string;
  startDate?: Date;
  endDate?: Date;
  currentWork?: boolean;
  userId: Types.ObjectId;
}

export interface ICertificate {
  title: string;
  certificateFile: string;
  userId: Types.ObjectId;
  verified: boolean;
}
export interface IWorkHistoryMethods {}

export interface WorkHistoryModel extends Model<IWorkHistory, {}, IWorkHistoryMethods> {
  updateUserTotalExperience(userId: string | Types.ObjectId): Promise<number>;
}
export type TWorkHistoryResponse = {
  _id: Types.ObjectId;
} & IWorkHistory;

export type TCertificateResponse = {
  _id: Types.ObjectId;
} & ICertificate;
