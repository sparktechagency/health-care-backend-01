import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { MedicineService } from './medicine.service';

const createMedicine = catchAsync(async (req: Request, res: Response) => {
  if (req.files && 'image' in req.files && req.files.image[0]) {
    req.body.image = '/images/' + req.files.image[0].filename;
  }
  req.body.addedBy = req.user.id;
  const result = await MedicineService.createMedicine(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Medicine created successfully',
    data: result,
  });
});

const getAllMedicines = catchAsync(async (req: Request, res: Response) => {
  const query: Record<string, any> = req.query;

  const result = await MedicineService.getAllMedicines(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medicines fetched successfully',
    pagination: {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      total: result.length,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    },
    data: result,
  });
});

const getMedicineById = catchAsync(async (req: Request, res: Response) => {
  const result = await MedicineService.getMedicineById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medicine fetched successfully',
    data: result,
  });
});

const updateMedicine = catchAsync(async (req: Request, res: Response) => {
  if (req.files && 'image' in req.files && req.files.image[0]) {
    req.body.image = '/images/' + req.files.image[0].filename;
  }

  const result = await MedicineService.updateMedicine(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medicine updated successfully',
    data: result,
  });
});

const deleteMedicine = catchAsync(async (req: Request, res: Response) => {
  const result = await MedicineService.deleteMedicine(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medicine deleted successfully',
    data: result,
  });
});

export const MedicineController = {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
