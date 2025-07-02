
import { Schema, model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { IShippingCost } from './shippingCost.interface';

const shippingCostSchema = new Schema<IShippingCost>(
  {
    // country: { type: String, required: true, unique: true },
   country: {
      type: [String],
      required: true,
    },
    cost: { type: Number, required: true },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ShippingCost = model<IShippingCost>('ShippingCost', shippingCostSchema);
