import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ShippingDetailsService } from './shippingDetails.service';

const createShippingDetails = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ShippingDetailsService.createShippingDetails(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'ShippingDetails created successfully',
      data: result,
    });
  }
);

const getAllShippingDetailss = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;

    const result = await ShippingDetailsService.getAllShippingDetailss(query);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'ShippingDetailss fetched successfully',
      data: result,
    });
  }
);

const getShippingDetailsById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ShippingDetailsService.getShippingDetailsById(
      req.params.id
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'ShippingDetails fetched successfully',
      data: result,
    });
  }
);

const updateShippingDetails = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ShippingDetailsService.updateShippingDetails(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'ShippingDetails updated successfully',
      data: result,
    });
  }
);

const deleteShippingDetails = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ShippingDetailsService.deleteShippingDetails(
      req.params.id
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'ShippingDetails deleted successfully',
      data: result,
    });
  }
);

export const ShippingDetailsController = {
  createShippingDetails,
  getAllShippingDetailss,
  getShippingDetailsById,
  updateShippingDetails,
  deleteShippingDetails,
};
