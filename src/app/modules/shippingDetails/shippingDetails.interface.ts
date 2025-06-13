import { Model, Types } from 'mongoose';

export type IShippingDetails = {
  pharmecy: Types.ObjectId;
  selectedArea: string;
  shippingPrice: number;
};

export type ShippingDetailsModel = Model<IShippingDetails>;
