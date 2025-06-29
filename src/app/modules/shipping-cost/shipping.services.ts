import { ShippingCost } from './shippingCost.model';
import { IShippingCost } from './shippingCost.interface';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '../../../enums/user';

const createShippingCost = async (payload: IShippingCost): Promise<IShippingCost> => {
  const user = await User.findById(payload.addedBy);

  if (!user || user.role !== USER_ROLES.ADMIN) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admins can create shipping cost');
  }

  const shipping = await ShippingCost.create(payload);
  return shipping;
};
const getAllShippingCosts = async (): Promise<IShippingCost[]> => {
  return await ShippingCost.find().populate('addedBy', 'name email');
};

const getShippingCostByCountry = async (country: string): Promise<number> => {
  const record = await ShippingCost.findOne({ country });
  return record?.cost ?? 0;
};

const calculateShippingCost = async ({ userId }: { userId: string }) => {
  const user = await User.findById(userId);
  if (!user || !user.country) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User or user country not found');
  }

  const costData = await ShippingCost.findOne({ country: user.country });
  const shippingCost = costData ? costData.cost : 0;

  return { shippingCost };
};

export const ShippingService = {
  createShippingCost,
  getAllShippingCosts,
  getShippingCostByCountry,
  calculateShippingCost,
};
