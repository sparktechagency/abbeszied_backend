import { Model } from 'mongoose';

export type ICategory = {
  name: string;
  type: 'client' | 'coach';
  image: string;
};

export type CategoryModel = Model<ICategory, Record<string, unknown>>;
