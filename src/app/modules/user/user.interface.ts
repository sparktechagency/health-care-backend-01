import { Model, Types } from 'mongoose';
import { GENDER, USER_ROLES } from '../../../enums/user';

export type IUser = {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  role: USER_ROLES;
  contact?: string;
  email: string;
  password: string;
  regNo?: string;
  location: string;
  city: string;
  postcode: string;
  country: string;
  subCategory: Types.ObjectId;
  gender: GENDER;
  profile?: string;
  designation?: string;
  signature?: string;
  dateOfBirth?: string;
  status: 'active' | 'delete';
  verified: boolean;
  pharmecyName?: string;
  accountInformation?: {
    bankAccountNumber?: string;
    stripeAccountId?: string;
    externalAccountId?: string;
    status?: string;
  };
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
