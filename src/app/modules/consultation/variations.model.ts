import { Schema, model } from 'mongoose';

const unitSchema = new Schema({
  unitPerBox: { type: String, required: true },
  sellingPrice: { type: Number, required: true }
}, { _id: true });

const variationSchema = new Schema({
  dosage: { type: String, required: true },
  units: [unitSchema]
}, { timestamps: true });

export const Variation = model('Variation', variationSchema);
