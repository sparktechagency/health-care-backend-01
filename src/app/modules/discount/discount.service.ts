import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Discount } from './discount.model';
import { IDiscount } from './discount.interface';

const createDiscount = async (payload: IDiscount): Promise<IDiscount> => {
  const result = await Discount.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create discount!');
  }
  return result;
};

const getAllDiscounts = async (
  queryFields: Record<string, any>
): Promise<IDiscount[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { country: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Discount.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getDiscountById = async (id: string): Promise<IDiscount | null> => {
  const result = await Discount.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Discount not found!');
  }
  return result;
};

const updateDiscount = async (
  id: string,
  payload: IDiscount
): Promise<IDiscount | null> => {
  const isExistDiscount = await getDiscountById(id);
  if (!isExistDiscount) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Discount not found!');
  }

  const result = await Discount.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update discount!');
  }
  return result;
};

const deleteDiscount = async (id: string): Promise<IDiscount | null> => {
  const isExistDiscount = await getDiscountById(id);
  if (!isExistDiscount) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Discount not found!');
  }

  const result = await Discount.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete discount!');
  }
  return result;
};

const verifyCoupon = async (discountCode: string): Promise<{
  isValid: boolean;
  message: string;
  discountPercent?: number;
  couponName?: string;
}> => {
  try {
    // Find the coupon by discountCode (case-insensitive)
    const coupon = await Discount.findOne({ 
      discountCode: { $regex: new RegExp(`^${discountCode}$`, 'i') }
    });

    if (!coupon) {
      return {
        isValid: false,
        message: 'Invalid coupon code. Please check and try again.',
      };
    }

    // Check date validity
    const currentDate = new Date();
    if (currentDate < coupon.startDate) {
      return {
        isValid: false,
        message: 'This coupon is not yet active.',
      };
    }

    if (currentDate > coupon.endDate) {
      return {
        isValid: false,
        message: 'This coupon has expired.',
      };
    }

    // Return success with discount percentage
    return {
      isValid: true,
      message: `Congratulations! You have ${coupon.parcentage}% discount!`,
      discountPercent: coupon.parcentage,
      couponName: coupon.name,
    };

  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Error verifying coupon: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};


export const DiscountService = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  verifyCoupon
};
