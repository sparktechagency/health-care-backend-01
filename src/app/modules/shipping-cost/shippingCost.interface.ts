
import { Types } from 'mongoose';

export interface IShippingCost {
  country: string[];
  cost: number;
  addedBy: Types.ObjectId;
}
