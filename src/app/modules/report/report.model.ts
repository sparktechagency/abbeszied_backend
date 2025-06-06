import { model, Schema } from 'mongoose';
import { IReport, ReportModel } from './report.interface';
import generateOrderNumber from '../../../utils/genarateOrderNumber';

const reportSchema = new Schema<IReport, ReportModel>(
     {
          customerId: {
               type: Schema.Types.ObjectId,
               required: true,
               ref: 'User',
          },
          sellerId: {
               type: Schema.Types.ObjectId,
               required: true,
               ref: 'User',
          },
          reportId: {
               type: String,
               required: true,
               default: function () {
                    return generateOrderNumber('rep-');
               },
          },
          location: {
               type: String,
               required: true,
          },
          image: {
               type: String,
               required: true,
          },
          type: {
               type: String,
               required: true,
          },
          reason: {
               type: String,
               required: true,
          },
          status: {
               type: String,
               required: true,
               enum: ['under review', 'resolved'],
               default: 'under review',
          },
     },
     { timestamps: true },
);

export const Report = model<IReport, ReportModel>('Report', reportSchema);
