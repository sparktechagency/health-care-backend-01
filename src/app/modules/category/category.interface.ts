import { Model, Types } from 'mongoose';

export type ICategory = {
  name: string;
  image: string;
  summary: string;
};

export type CategoryModel = Model<ICategory>;
