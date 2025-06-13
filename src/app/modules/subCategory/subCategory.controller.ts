import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SubCategoryService } from './subCategory.service';

const createSubCategory = catchAsync(async (req: Request, res: Response) => {
  let image: any;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
    req.body.image = image;
  }
  const result = await SubCategoryService.createSubCategory(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'SubCategory created successfully',
    data: result,
  });
});

const getAllSubCategorys = catchAsync(async (req: Request, res: Response) => {
  const search: any = req.query.search || '';
  const page = req.query.page || null;
  const limit = req.query.limit || null;
  const queryFields: any = req.query;
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  const result = await SubCategoryService.getAllSubCategorys(
    search as string,
    page as number | null,
    limit as number | null,
    queryFields
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'SubCategorys fetched successfully',
    data: result,
  });
});

const getSubCategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCategoryService.getSubCategoryById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'SubCategory fetched successfully',
    data: result,
  });
});

const updateSubCategory = catchAsync(async (req: Request, res: Response) => {
  let image: any;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
    req.body.image = image;
  }
  console.log(image);
  const result = await SubCategoryService.updateSubCategory(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'SubCategory updated successfully',
    data: result,
  });
});

const deleteSubCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCategoryService.deleteSubCategory(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'SubCategory deleted successfully',
    data: result,
  });
});

export const SubCategoryController = {
  createSubCategory,
  getAllSubCategorys,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
};
