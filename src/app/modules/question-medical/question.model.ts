import { Schema, model } from 'mongoose';
import { ImedicalQuestion, QuestionModel } from './question.interface';

const questionSchema = new Schema<ImedicalQuestion, QuestionModel>(
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

export const MedicalQuestionQuestion = model<ImedicalQuestion, QuestionModel>(
  'MedicalQuestion',
  questionSchema
);
