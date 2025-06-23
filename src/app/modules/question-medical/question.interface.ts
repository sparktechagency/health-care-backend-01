import { Model, Types } from 'mongoose';

export type ImedicalQuestion = {
  question: string;
  subCategory: Types.ObjectId;
};

export type QuestionModel = Model<ImedicalQuestion>;
