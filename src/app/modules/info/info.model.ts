import { Schema, model } from 'mongoose';
import { IInfo, InfoModel } from './info.interface';

const infoSchema = new Schema<IInfo, InfoModel>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const Info = model<IInfo, InfoModel>('Info', infoSchema);
