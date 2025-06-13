import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../types/pagination';
import { User } from './user.model';
import { HelperService } from '../../../helpers/helper.service';
import ApiError from '../../../errors/ApiError';
import { USER_ROLES } from '../../../enums/user';
import  {addUserCountryToDB}  from './user.service';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    userData.role = USER_ROLES.USER;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let signature;
    if (req.files && 'signature' in req.files && req.files.signature[0]) {
      signature = `/images/${req.files.signature[0].filename}`;
    }
    let profile;
    if (req.files && 'profile' in req.files && req.files.profile[0]) {
      profile = `/images/${req.files.profile[0].filename}`;
    }
    const data = {
      profile,
      signature,
      ...req.body,
    };

    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const addCountryToUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, country } = req.body;

    if (!userId || !country) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'User ID and country are required',
      });
    }

    const updatedUser = await addUserCountryToDB(userId, country);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Country added successfully',
      data: updatedUser,
    });
  }
);

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  query.role = USER_ROLES.USER;
  const result = await HelperService.getAllDataFromDB(query, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users data retrieved successfully',
    pagination: {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      totalPage: result.totalPages,
      total: result.data.length,
    },
    data: result.data,
  });
});
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const id = (req.params.id as string) || (req.user.id as string);
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  const result = await HelperService.getSingleDataFromDB(id, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = (req.params.id as string) || (req.user.id as string);
    if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');

    const data = req.body;

    const result = await UserService.updateUserToDB(id, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User updated successfully',
      data: result,
    });
  }
);
const lockUser = catchAsync(async (req: Request, res: Response) => {
  const id = (req.params.id as string) || (req.user.id as string);
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');

  const result = await UserService.lockUserToDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User locked successfully',
    data: result,
  });
});
export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUser,
  lockUser,
  addCountryToUser,
};
