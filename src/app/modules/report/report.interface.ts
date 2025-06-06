import { Model, Types } from 'mongoose';

export type IReport = {
     customerId: Types.ObjectId;
     sellerId: Types.ObjectId;
     reportId: string;
     location: string;
     image: string;
     type: string;
     reason: string;
     status: 'under review' | 'resolved';
};

export type ReportModel = Model<IReport, Record<string, unknown>>;
