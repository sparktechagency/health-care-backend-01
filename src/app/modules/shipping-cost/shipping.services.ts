import { ShippingCost } from './shippingCost.model';
import { IShippingCost } from './shippingCost.interface';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '../../../enums/user';

// const createShippingCost = async (payload: IShippingCost): Promise<IShippingCost> => {
//   const user = await User.findById(payload.addedBy);

//   if (!user || user.role !== USER_ROLES.ADMIN) {
//     throw new ApiError(StatusCodes.FORBIDDEN, 'Only admins can create shipping cost');
//   }

//   const shipping = await ShippingCost.create(payload);
//   return shipping;
// };
const createShippingCost = async (payload: IShippingCost): Promise<IShippingCost> => {
  const user = await User.findById(payload.addedBy);

  if (!user || user.role !== USER_ROLES.ADMIN) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admins can create shipping cost');
  }

  // Optional: prevent duplicates manually
  const existing = await ShippingCost.findOne({
    country: { $in: payload.country },
  });

  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, `One or more countries already have a shipping cost`);
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

const updateShippingCostById = async (
  id: string,
  updateData: Partial<IShippingCost>
): Promise<IShippingCost | null> => {
  const existing = await ShippingCost.findById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Shipping cost not found');
  }

  if (updateData.country) {
    const newCountries = Array.isArray(updateData.country)
      ? updateData.country
      : [updateData.country];

    const currentCountries = existing.country || [];

    const conflictingDocs = await ShippingCost.find({
      _id: { $ne: id },
      country: { $in: newCountries },
    });

    if (conflictingDocs.length > 0) {
      const conflictingCountries = conflictingDocs.flatMap(doc => doc.country);

      const duplicates = newCountries.filter(
        (c) => conflictingCountries.includes(c) && !currentCountries.includes(c)
      );

      if (duplicates.length > 0) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          `One or more countries already have a shipping cost: ${duplicates.join(', ')}`
        );
      }
    }

    updateData.country = newCountries;
  }

  const updated = await ShippingCost.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return updated;
};

const deleteShippingCostById = async (id: string): Promise<IShippingCost | null> => {
  const deleted = await ShippingCost.findByIdAndDelete(id);
  return deleted;
};



export const ShippingService = {
  createShippingCost,
  getAllShippingCosts,
  getShippingCostByCountry,
  calculateShippingCost,
  updateShippingCostById,
  deleteShippingCostById
};
