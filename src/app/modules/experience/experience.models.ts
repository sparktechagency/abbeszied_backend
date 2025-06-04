import { Schema, model } from 'mongoose';
import { ICertificate, IWorkHistory } from './experience.interface';

const workHistorySchema = new Schema<IWorkHistory>(
  {
    companyName: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

const certificateSchema = new Schema<ICertificate>(
  {
    title: {
      type: String,
      required: false,
    },
    certificateFile: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

export const WorkHistory = model<IWorkHistory>('WorkHistory', workHistorySchema);
export const Certificate = model<ICertificate>('Certificate', certificateSchema);