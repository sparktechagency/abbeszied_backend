import { model, Schema } from 'mongoose';
import { BannerModel, IBanner } from './banner.interface';
import { USER_ROLE } from '../user/user.constants';

const bannerSchema = new Schema<IBanner, BannerModel>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['client', 'corporate', 'coach', 'clientStore', 'coachStore'],
      required: true,
    },
  },
  { timestamps: true },
);

export const Banner = model<IBanner, BannerModel>('Banner', bannerSchema);
