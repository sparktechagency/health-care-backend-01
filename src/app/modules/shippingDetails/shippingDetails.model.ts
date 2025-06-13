import { Schema, model } from 'mongoose';
import {
  IShippingDetails,
  ShippingDetailsModel,
} from './shippingDetails.interface';

const shippingDetailsSchema = new Schema<
  IShippingDetails,
  ShippingDetailsModel
>(
  {
    pharmecy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    selectedArea: { type: String, required: true },
    shippingPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export const ShippingDetails = model<IShippingDetails, ShippingDetailsModel>(
  'ShippingDetails',
  shippingDetailsSchema
);
