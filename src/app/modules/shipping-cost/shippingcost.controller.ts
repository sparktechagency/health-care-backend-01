import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ShippingService } from './shipping.services';
import { StatusCodes } from 'http-status-codes';

const createShippingCost = catchAsync(async (req: Request, res: Response) => {
  req.body.addedBy = req.user.id; // ⬅️ Use `req.user.id` just like medicine

  const result = await ShippingService.createShippingCost(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Shipping cost created successfully',
    data: result,
  });
});

const getAllShippingCosts = catchAsync(async (req: Request, res: Response) => {
  const result = await ShippingService.getAllShippingCosts();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Shipping costs fetched successfully',
    data: result,
  });
});


export const ShippingController = {
  createShippingCost,
  getAllShippingCosts,
};
