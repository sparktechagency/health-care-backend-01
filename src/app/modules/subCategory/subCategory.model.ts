import { Schema, model } from 'mongoose';
import { ISubCategory, SubCategoryModel } from './subCategory.interface';

const subCategorySchema = new Schema<ISubCategory, SubCategoryModel>(
  {
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String, required: true },
    details: { type: String, required: true },
    subDetails: { type: String, required: true },
  },
  { timestamps: true }
);

export const SubCategory = model<ISubCategory, SubCategoryModel>(
  'SubCategory',
  subCategorySchema
);
