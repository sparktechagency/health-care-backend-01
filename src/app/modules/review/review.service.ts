import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Review } from './review.model';
import { IReview } from './review.interface';
import { USER_ROLES } from '../../../enums/user';

const createReview = async (payload: IReview): Promise<IReview> => {
  const result = await Review.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create review!');
  }
  return result;
};

const getAllReviews = async (
  queryFields: Record<string, any>,
  role: string
): Promise<IReview[]> => {
  if (role === USER_ROLES.USER) {
    queryFields.status = 'approved';
  }
  const { search, page, limit } = queryFields;
  const query = search
    ? { $or: [{ description: { $regex: search, $options: 'i' } }] }
    : {};
  let queryBuilder = Review.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields).populate({
    path: 'user',
    select: 'firstName email profile location ',
  });
  return await queryBuilder;
};

const getReviewById = async (id: string): Promise<IReview | null> => {
  const result = await Review.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Review not found!');
  }
  return result;
};

const updateReview = async (
  id: string,
  payload: IReview
): Promise<IReview | null> => {
  const isExistReview = await getReviewById(id);
  if (!isExistReview) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Review not found!');
  }

  const result = await Review.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update review!');
  }
  return result;
};

const deleteReview = async (id: string): Promise<IReview | null> => {
  const isExistReview = await getReviewById(id);
  if (!isExistReview) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Review not found!');
  }

  const result = await Review.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete review!');
  }
  return result;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
