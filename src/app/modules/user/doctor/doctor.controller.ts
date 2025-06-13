import catchAsync from '../../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import sendResponse from '../../../../shared/sendResponse';
import { Request, Response } from 'express';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { HelperService } from '../../../../helpers/helper.service';
import { USER_ROLES } from '../../../../enums/user';
import { DoctorService } from './doctor.service';

const addDoctor = catchAsync(async (req: Request, res: Response) => {
  const doctorData = {
    role: USER_ROLES.DOCTOR,
    verified: true,
    ...req.body,
  };
  const result = await HelperService.addDataToDB(doctorData, User);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctor created successfully',
    data: result,
  });
});

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  query.role = USER_ROLES.DOCTOR;
  const result = await HelperService.getAllDataFromDB(query, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctors data retrieved successfully',
    data: result.data,
    pagination: {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      totalPage: result.totalPages,
      total: result.data.length,
    },
  });
});
const getSingleDoctor = catchAsync(async (req: Request, res: Response) => {
  const id = (req.params.id as string) || (req.user.id as string);
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'Doctor not found');
  const result = await HelperService.getSingleDataFromDB(id, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctor retrieved successfully',
    data: result,
  });
});

const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'Doctor not found');
  const result = await HelperService.deleteDataByIDFromDB(id, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctor deleted successfully',
    data: result,
  });
});

const getDoctorStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;
  const result = await DoctorService.getDoctorStatus(user as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctor status retrived successfully',
    data: result,
  });
});

const getDoctorActivityStatus = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user.id;
    const year = req.query.year;

    const result = await DoctorService.getDoctorActivityStatusFromDB(
      user,
      Number(year)
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Doctor status retrived successfully',
      data: result,
    });
  }
);
const setUpStripeConnectAccount = catchAsync(
  async (req: Request, res: Response) => {
    const data = req.body.data;
    let paths: any[] = [];

    const ip = req.ip || '0.0.0.0';
    // if (req.files && 'KYC' in req.files && req.files.KYC) {
    //   for (const file of req.files.KYC) {
    //     paths.push(`/KYCs/${file.filename}`);
    //   }
    // }
    console.log(data);
    const user = req.user;
    if (!req.user.email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    const result = await DoctorService.setUpStripeConnectAccount(
      data,
      req.files,
      user,
      paths,
      ip
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Connected account created successfully',
      data: result,
    });
  }
);
const getDoctorEarningStatus = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user.id;
    const year = req.query.year;

    const result = await DoctorService.getDoctorEarningStatusFromDB(
      user,
      Number(year)
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Doctor status retrived successfully',
      data: result,
    });
  }
);
const getDoctorEarnings = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;
  const result = await DoctorService.getDoctorEarningsFromDB(user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctor status retrived successfully',
    data: result,
  });
});

const getDoctorEarningHistory = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user.id;
    const result = await DoctorService.getDoctorEarningHistory(user);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Doctor withdrawls retrived successfully',
      data: result,
    });
  }
);

export const DoctorController = {
  addDoctor,
  getAllDoctors,
  getSingleDoctor,
  deleteDoctor,
  getDoctorStatus,
  getDoctorActivityStatus,
  setUpStripeConnectAccount,
  getDoctorEarningStatus,
  getDoctorEarnings,
  getDoctorEarningHistory,
};
