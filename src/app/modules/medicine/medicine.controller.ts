import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { MedicineService } from './medicine.service';
import mongoose from 'mongoose';


// const createMedicine = catchAsync(async (req: Request, res: Response) => {
//   if (req.files && 'image' in req.files && req.files.image[0]) {
//     req.body.image = '/images/' + req.files.image[0].filename;
//   }

//   req.body.addedBy = req.user.id;

//   // ✅ Parse `variations` string into array
//   if (typeof req.body.variations === 'string') {
//     try {
//       req.body.variations = JSON.parse(req.body.variations);
//     } catch (err) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid JSON in variations field',
//         error: err instanceof Error ? err.message : err,
//       });
//     }
//   }

//   const result = await MedicineService.createMedicine(req.body);

//   sendResponse(res, {
//     statusCode: StatusCodes.CREATED,
//     success: true,
//     message: 'Medicine created successfully',
//     data: result,
//   });
// });
const createMedicine = catchAsync(async (req: Request, res: Response) => {
  if (req.files && 'image' in req.files && req.files.image[0]) {
    req.body.image = '/images/' + req.files.image[0].filename;
  }

  req.body.addedBy = req.user.id;

  // ✅ Parse variations
  if (typeof req.body.variations === 'string') {
    try {
      req.body.variations = JSON.parse(req.body.variations);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON in variations field',
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  // ✅ Convert country string to array if needed
  if (typeof req.body.country === 'string') {
    try {
      req.body.country = JSON.parse(req.body.country);
    } catch {
      req.body.country = [req.body.country];
    }
  }

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

export const getUserMedicinesController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required.' 
      });
    }

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid User ID format.' 
      });
    }

    const result = await MedicineService.getUserMedicinesService(userId);
    
    return res.status(200).json({
      success: true,
      data: result,
      message: 'User medicines fetched successfully'
    });
  } catch (error) {
    console.error('Error in getUserMedicinesController:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
};

export const MedicineController = {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getUserMedicinesController
  
};
