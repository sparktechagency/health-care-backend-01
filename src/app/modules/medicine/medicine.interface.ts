// import { Model, Types } from 'mongoose';

import { Model, Types } from "mongoose";

// export type IMedicine = {
//   name: string;
//   company: string;
//   dosage: [string];
//   country: string;
//   image: string;
//   unitPerBox: [string];
//   form: string;
//   description: string;
//   purchaseCost: number;
//   subCategory: Types.ObjectId;
//   tax: number;
//   externalExpenses: number;
//   sellingPrice: number;
//   addedBy: Types.ObjectId;
// };

// export type MedicineModel = Model<IMedicine>;
export interface IUnitVariation {
  unitPerBox: string;
  // purchaseCost: number;
  // tax: number;
  // externalExpenses: number;
  sellingPrice: number;
}

export interface IMedicineVariation {
  dosage: string;
  units: IUnitVariation[];
}

export interface IMedicine {
  name: string;
  company: string;
  country: string;
  image: string;
  form: string;
  description: string;
  subCategory: Types.ObjectId;
  addedBy: Types.ObjectId;
  variations: IMedicineVariation[];
}

export type MedicineModel = Model<IMedicine>;
