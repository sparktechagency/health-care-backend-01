import { Model, Types } from 'mongoose';

export type IQuestion = {
  question: string;
  subCategory: Types.ObjectId;
};

export type QuestionModel = Model<IQuestion>;
