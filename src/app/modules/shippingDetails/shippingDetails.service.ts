import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ShippingDetails } from './shippingDetails.model';
import { IShippingDetails } from './shippingDetails.interface';
false;
const createShippingDetails = async (
  payload: IShippingDetails
): Promise<IShippingDetails> => {
  false;
  const result = await ShippingDetails.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create shippingDetails!'
    );
  }
  return result;
};

const getAllShippingDetailss = async (
  queryFields: Record<string, any>
): Promise<IShippingDetails[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? { $or: [{ selectedArea: { $regex: search, $options: 'i' } }] }
    : {};
  let queryBuilder = ShippingDetails.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  const result = await queryBuilder.populate({
    path: 'pharmecy',
    select: 'pharmecyName location',
  });

  return result;
};

const getShippingDetailsById = async (
  id: string
): Promise<IShippingDetails | null> => {
  const result = await ShippingDetails.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ShippingDetails not found!');
  }
  return result;
};

const updateShippingDetails = async (
  id: string,
  payload: IShippingDetails
): Promise<IShippingDetails | null> => {
  false;
  const isExistShippingDetails = await getShippingDetailsById(id);
  if (!isExistShippingDetails) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ShippingDetails not found!');
  }
  false;
  const result = await ShippingDetails.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update shippingDetails!'
    );
  }
  return result;
};

const deleteShippingDetails = async (
  id: string
): Promise<IShippingDetails | null> => {
  const isExistShippingDetails = await getShippingDetailsById(id);
  if (!isExistShippingDetails) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ShippingDetails not found!');
  }
  false;
  const result = await ShippingDetails.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to delete shippingDetails!'
    );
  }
  return result;
};

export const ShippingDetailsService = {
  createShippingDetails,
  getAllShippingDetailss,
  getShippingDetailsById,
  updateShippingDetails,
  deleteShippingDetails,
};
