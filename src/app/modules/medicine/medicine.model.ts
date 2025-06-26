// import { Schema, model } from 'mongoose';
// import { IMedicine, MedicineModel } from './medicine.interface';

import { model, Schema } from "mongoose";
import { IMedicine, MedicineModel } from "./medicine.interface";

// const medicineSchema = new Schema<IMedicine, MedicineModel>(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     company: {
//       type: String,
//       required: true,
//     },
//     dosage: {
//       type: [String],
//       required: true,
//     },
//     country: {
//       type: String,
//       required: true,
//     },
//     image: {
//       type: String,
//       required: true,
//     },
//     unitPerBox: {
//       type: [String],
//       required: true,
//     },
//     subCategory: {
//       type: Schema.Types.ObjectId,
//       ref: 'SubCategory',
//       required: true,
//     },
//     form: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     purchaseCost: {
//       type: Number,
//       required: true,
//     },
//     tax: {
//       type: Number,
//       required: true,
//     },
//     externalExpenses: {
//       type: Number,
//       required: true,
//     },
//     sellingPrice: {
//       type: Number,
//       required: true,
//     },
//     addedBy: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export const Medicine = model<IMedicine, MedicineModel>(
//   'Medicine',
//   medicineSchema
// );
const medicineSchema = new Schema<IMedicine, MedicineModel>(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    country: { type: String, required: true },
    image: { type: String, required: true },
    form: { type: String, required: true },
    description: { type: String, required: true },
    subCategory: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

variations: [
  {
    dosage: { type: String, required: true },
    units: [
      {
        unitPerBox: { type: String, required: true },
        sellingPrice: { type: Number, required: true },
      }
    ]
  }
]

  },
  { timestamps: true }
);
export const Medicine = model<IMedicine, MedicineModel>(
  'Medicine',
  medicineSchema
);