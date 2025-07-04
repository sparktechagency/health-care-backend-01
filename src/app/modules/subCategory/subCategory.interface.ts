import { Model, Types } from 'mongoose';

export type ISubCategory = {
  _id: Types.ObjectId;
  name: string;
  category: Types.ObjectId;
  image: string;
  totalQuestions?: number;
  introduction?: string;
  details: string;
  subDetails: string;
};

export type SubCategoryModel = Model<ISubCategory>;
