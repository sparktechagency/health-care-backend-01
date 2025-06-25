import { Model, Types } from 'mongoose';

export interface IDiscount extends Document {
  name: string;
  country: string[];
  discountCode: string;
  startDate: Date;
  endDate: Date;
  parcentage: number; 
}

export type DiscountModel = Model<IDiscount>;
