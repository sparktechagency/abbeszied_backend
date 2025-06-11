import { Types } from 'mongoose';

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
}

export type TWorkHistoryResponse = {
  _id: Types.ObjectId;
} & IWorkHistory;

export type TCertificateResponse = {
  _id: Types.ObjectId;
} & ICertificate;
