import { Schema, model } from 'mongoose';
import { IReport } from './report.interface';

const reportSchema = new Schema<IReport>(
  {
    produtId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
      required: true,
    }, 
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

export const Report = model<IReport>('Report', reportSchema);
