import { Schema, model } from 'mongoose';
import { IDiscount, DiscountModel } from './discount.interface';

const discountSchema = new Schema<IDiscount, DiscountModel>(
  {
    name: { type: String, required: false },
    country: [{ type: String, required: false }],
    discountCode: { type: String, required: false, unique: true },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    parcentage: { 
      type: Number, 
      required: false,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);
export const Discount = model<IDiscount, DiscountModel>(
  'Discount',
  discountSchema
);
