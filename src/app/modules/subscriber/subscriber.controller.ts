import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SubscriberService } from './subscriber.service';

const createSubscriber = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriberService.createSubscriber(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Subscriber created successfully',
    data: result,
  });
});

const getAllSubscribers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await SubscriberService.getAllSubscribers(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    pagination: {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      total: result.length,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    },
    message: 'Subscribers fetched successfully',
    data: result,
  });
});

const getSubscriberById = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriberService.getSubscriberById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscriber fetched successfully',
    data: result,
  });
});

const updateSubscriber = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriberService.updateSubscriber(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscriber updated successfully',
    data: result,
  });
});

const deleteSubscriber = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriberService.deleteSubscriber(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscriber deleted successfully',
    data: result,
  });
});

export const SubscriberController = {
  createSubscriber,
  getAllSubscribers,
  getSubscriberById,
  updateSubscriber,
  deleteSubscriber,
};
