import { Model, Types } from 'mongoose';

export type IMedicine = {
  name: string;
  company: string;
  dosage: [string];
  country: string;
  image: string;
  unitPerBox: [string];
  form: string;
  description: string;
  purchaseCost: number;
  subCategory: Types.ObjectId;
  tax: number;
  externalExpenses: number;
  sellingPrice: number;
  addedBy: Types.ObjectId;
};

export type MedicineModel = Model<IMedicine>;
