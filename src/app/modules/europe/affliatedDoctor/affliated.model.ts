import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAffiliatedDoctor } from './affliated.interface';

const affiliatedDoctorSchema = new Schema<IAffiliatedDoctor>(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    image: { type: String, required: false },
  },
  { timestamps: true }
);

const AffiliatedDoctor = mongoose.model<IAffiliatedDoctor, Model<IAffiliatedDoctor>>('AffiliatedDoctor', affiliatedDoctorSchema);

export { AffiliatedDoctor };
