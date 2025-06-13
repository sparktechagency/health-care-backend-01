import { Schema, model } from 'mongoose';
import { IQuestion, QuestionModel } from './question.interface';

const questionSchema = new Schema<IQuestion, QuestionModel>(
  {
    question: { type: String, required: true },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
    },
  },
  { timestamps: true }
);

export const Question = model<IQuestion, QuestionModel>(
  'Question',
  questionSchema
);
