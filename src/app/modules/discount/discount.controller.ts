import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { DiscountService } from './discount.service';

const createDiscount = catchAsync(async (req: Request, res: Response) => {
  const result = await DiscountService.createDiscount(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Discount created successfully',
    data: result,
  });
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
};
