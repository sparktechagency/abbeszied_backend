import { Schema, model } from 'mongoose';
import { ISupport } from './support.interface';

const supportSchema = new Schema<ISupport>(
     {
          email: {
               type: String,
               default: '',
          },
          phone: {
               type: String,
               default: '',
          },
     },
     { timestamps: true },
);

// Create the model
const Support = model<ISupport>('Support', supportSchema);

export default Support;
