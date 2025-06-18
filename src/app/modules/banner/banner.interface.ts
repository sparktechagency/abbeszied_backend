import { Model } from 'mongoose';

export type IBanner = {
  name: string;
  image: string;
  type: 'client' | 'corporate' | 'coach' | 'clientStore' | 'coachStore';
};

export type BannerModel = Model<IBanner>;
