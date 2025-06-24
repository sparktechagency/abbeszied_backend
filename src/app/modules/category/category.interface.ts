import { Model } from 'mongoose';

export type ICategory = {
  name: string;
  type: 'corporate' | 'coach' | 'store';
  count: number;
  image: string;
};

export type CategoryModel = Model<ICategory, Record<string, unknown>>;
