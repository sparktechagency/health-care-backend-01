import catchAsync from '../../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import sendResponse from '../../../../shared/sendResponse';
import { Request, Response } from 'express';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { HelperService } from '../../../../helpers/helper.service';
import { USER_ROLES } from '../../../../enums/user';
import { ConsultationService } from '../../consultation/consultation.service';
import { PharmecyService } from './pharmecy.service';

const addPharmecy = catchAsync(async (req: Request, res: Response) => {
  const { ...pharmecyData } = req.body;
  pharmecyData.role = USER_ROLES.PHARMACY;
  pharmecyData.verified = true;
  const result = await HelperService.addDataToDB(pharmecyData, User);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Pharmecy created successfully',
    data: result,
  });
});

const getAllPharmecy = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  query.role = USER_ROLES.PHARMACY;
  const result = await HelperService.getAllDataFromDB(query, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Pharmecy data retrieved successfully',
    data: result.data,
    pagination: {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      totalPage: result.totalPages,
      total: result.data.length,
    },
  });
});
const getSinglePharmecy = catchAsync(async (req: Request, res: Response) => {
  const id = (req.params.id as string) || (req.user.id as string);
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'Pharmecy not found');
  const result = await HelperService.getSingleDataFromDB(id, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Pharmecy retrieved successfully',
    data: result,
  });
});

const deletePharmecy = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'Pharmecy not found');
  const result = await HelperService.deleteDataByIDFromDB(id, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Pharmecy deleted successfully',
    data: result,
  });
});

const GetPharmecyStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;
  const result = await PharmecyService.getPharmecyStatus(user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Pharmecy status retrieved successfully',
    data: result,
  });
});
const GetPharmecyWorkload = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;
  const year = req.query.year;
  const result = await PharmecyService.getPharmecyWorkload(Number(year));
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Pharmecy workload retrieved successfully',
    data: result,
  });
});
const getPharmecyEarnings = catchAsync(async (req: Request, res: Response) => {
  const year = req.query.year;
  const result = await PharmecyService.getPharmecyEarnings(Number(year));
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Pharmecy earnings retrieved successfully',
    data: result,
  });
});
export const PharmecyController = {
  addPharmecy,
  getAllPharmecy,
  getSinglePharmecy,
  deletePharmecy,
  GetPharmecyStatus,
  GetPharmecyWorkload,
  getPharmecyEarnings,
};
