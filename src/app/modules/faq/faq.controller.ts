import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { FaqService } from './faq.service';

const createFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqService.createFaq(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Faq created successfully',
    data: result,
  });
});

const getAllFaqs = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await FaqService.getAllFaqs(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faqs fetched successfully',
    // pagination: {
    //   limit: Number(query.limit) || 10,
    //   page: Number(query.page) || 1,
    //   total: result.length,
    //   totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    // },
    data: result,
  });
});

const getFaqById = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqService.getFaqById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faq fetched successfully',
    data: result,
  });
});

const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqService.updateFaq(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faq updated successfully',
    data: result,
  });
});

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqService.deleteFaq(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faq deleted successfully',
    data: result,
  });
});

export const FaqController = {
  createFaq,
  getAllFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
};
