import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ShippingService } from './shipping.services';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ShippingCost } from './shippingCost.model';
import { IShippingCost } from './shippingCost.interface';

// const createShippingCost = catchAsync(async (req: Request, res: Response) => {
//   req.body.addedBy = req.user.id; // ⬅️ Use `req.user.id` just like medicine

//   const result = await ShippingService.createShippingCost(req.body);

//   sendResponse(res, {
//     statusCode: StatusCodes.CREATED,
//     success: true,
//     message: 'Shipping cost created successfully',
//     data: result,
//   });
// });
const createShippingCost = catchAsync(async (req: Request, res: Response) => {
  req.body.addedBy = req.user.id;

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

//get shipping cost by country
const getShippingCostByCountry = catchAsync(async (req: Request, res: Response) => {
  const { country } = req.query;

  if (!country || typeof country !== 'string') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Country query parameter is required');
  }

  const result = await ShippingService.getShippingCostByCountry(country);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Shipping cost for ${country} fetched successfully`,
    data: result,
  });
});
const updateShippingCost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await ShippingService.updateShippingCostById(id, updateData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Shipping cost updated successfully',
    data: result,
  });
});
const deleteShippingCost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deletedShippingCost = await ShippingService.deleteShippingCostById(id);

  if (!deletedShippingCost) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Shipping cost not found');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Shipping cost deleted successfully',
    data: deletedShippingCost,
  });
});



export const ShippingController = {
  createShippingCost,
  getAllShippingCosts,
  getShippingCostByCountry,
  updateShippingCost,
  deleteShippingCost
};
