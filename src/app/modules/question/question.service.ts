import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Question } from './question.model';
import { IQuestion } from './question.interface';

const createQuestion = async (payload: IQuestion): Promise<IQuestion> => {
  const result = await Question.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create question!');
  }
  return result;
};

const getAllQuestions = async (
  queryFields: Record<string, any>
): Promise<IQuestion[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? { $or: [{ question: { $regex: search, $options: 'i' } }] }
    : {};
  let queryBuilder = Question.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields).populate('subCategory');
  return await queryBuilder;
};

const getQuestionById = async (id: string): Promise<IQuestion | null> => {
  const result = await Question.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Question not found!');
  }
  return result;
};

const updateQuestion = async (
  id: string,
  payload: IQuestion
): Promise<IQuestion | null> => {
  const isExistQuestion = await getQuestionById(id);
  if (!isExistQuestion) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Question not found!');
  }

  const result = await Question.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update question!');
  }
  return result;
};

const deleteQuestion = async (id: string): Promise<IQuestion | null> => {
  const isExistQuestion = await getQuestionById(id);
  if (!isExistQuestion) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Question not found!');
  }

  const result = await Question.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete question!');
  }
  return result;
};

export const QuestionService = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
