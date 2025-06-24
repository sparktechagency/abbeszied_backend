import { model, Schema } from 'mongoose';
import { ICategory, CategoryModel } from './category.interface';

const serviceSchema = new Schema<ICategory, CategoryModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['corporate', 'coach', 'store'],
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Category = model<ICategory, CategoryModel>(
  'Category',
  serviceSchema,
);
