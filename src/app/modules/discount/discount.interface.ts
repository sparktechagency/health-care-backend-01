import { Model, Types } from 'mongoose';

export type IDiscount = {
  country: string;
  name: string;
  startDate: Date;
  endDate: Date;
  amount: number;
};

export type DiscountModel = Model<IDiscount>;
