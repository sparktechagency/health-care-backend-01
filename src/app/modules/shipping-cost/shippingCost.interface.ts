import { Model } from "mongoose";

export interface IShippingCost {
  country: string; // Full country name (e.g., 'Germany', 'France')
  cost: number; // Shipping cost
  createdBy: string; // Admin user ID
   addedBy: string;
  updatedBy?: string; // Admin user ID for updates
}

export interface ShippingCostModel extends Model<IShippingCost> {
  getShippingCostByCountry(country: string): Promise<IShippingCost | null>;
}