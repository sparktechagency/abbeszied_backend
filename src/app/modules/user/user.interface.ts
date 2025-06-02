import { Model } from 'mongoose';

import { USER_ROLE } from './user.constants';

interface IAddress {
  house: string;
  area: string;
  city: string;
  state: string;
  country: string;
}

export interface TClientCreate {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: (typeof USER_ROLE)[keyof typeof USER_ROLE];
}

export interface TCoachCreate extends TClientCreate {
  category?: string;
  traningVanue?: string[];
  cerificates?: string[];
  interests?: string[];
}

export interface TUser extends TCoachCreate {
  _id: string;
  image: string;
  revenue?: number;
  stripeConnectedAcount: string;
  stripeCustomerId: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface UserModel extends Model<TUser> {
  isUserExist(email: string): Promise<TUser>;
  isUserActive(email: string): Promise<TUser>;
  IsUserExistById(id: string): Promise<TUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}

export type IPaginationOption = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
