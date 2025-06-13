import { Model, Types } from 'mongoose';

export type IOrder = {
  trackingNo: string;
  company: string;
  country: string;
  city: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orderDate?: Date;
  price: number;
  zipCode?: string;
  status?: string;
};

export type OrderModel = Model<IOrder>;
