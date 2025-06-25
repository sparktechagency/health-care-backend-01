import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { DiscountService } from './discount.service';
import { IDiscount } from './discount.interface';
import { Discount } from './discount.model';
import ApiError from '../../../errors/ApiError';

const createDiscount = catchAsync(async (req: Request, res: Response) => {
  const result = await DiscountService.createDiscount(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Discount created successfully',
    data: result,
  });
});


const verifyCouponCode = catchAsync(async (req: Request, res: Response) => {
  const { discountCode } = req.body;

  // Validate required field
  if (!discountCode || discountCode.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Discount code is required',
    });
  }

  const result = await DiscountService.verifyCoupon(discountCode.trim());

  if (result.isValid) {
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: result.message,
      data: {
        discountCode: discountCode.trim(),
        discountPercent: result.discountPercent,
        couponName: result.couponName,
      },
    });
  } else {
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: result.message,
      data: null,
    });
  }
});

const getAllDiscounts = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await DiscountService.getAllDiscounts(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Discounts fetched successfully',
    data: result,
  });
});

const getDiscountById = catchAsync(async (req: Request, res: Response) => {
  const result = await DiscountService.getDiscountById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Discount fetched successfully',
    data: result,
  });
});

const updateDiscount = catchAsync(async (req: Request, res: Response) => {
  const result = await DiscountService.updateDiscount(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Discount updated successfully',
    data: result,
  });
});

const deleteDiscount = catchAsync(async (req: Request, res: Response) => {
  const result = await DiscountService.deleteDiscount(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Discount deleted successfully',
    data: result,
  });
});

export const DiscountController = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  verifyCouponCode
};
