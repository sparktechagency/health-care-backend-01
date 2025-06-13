import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.service';
import ApiError from '../../../errors/ApiError';

const createNotification = catchAsync(async (req: Request, res: Response) => {
  //@ts-ignore
  const io = global.io;
  const result = await NotificationService.createNotification(req.body, io);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Notification created successfully',
    data: result,
  });
});

const getAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const userId = req.user.id;
  const result = await NotificationService.getAllNotifications(query, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications fetched successfully',
    unreadCount: result.unreadCount,
    data: result.data,
  });
});

const getNotificationById = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.getNotificationById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification fetched successfully',
    data: result,
  });
});

const updateNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.updateNotification(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification updated successfully',
    data: result,
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.deleteNotification(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification deleted successfully',
    data: result,
  });
});

const readAllNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await NotificationService.readNotificationFromDB(
    userId as string
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification read successfully',
    data: result,
  });
});

const sendNotificationToAllUsers = catchAsync(
  async (req: Request, res: Response) => {
    const role = req.params.role;
    const message = req.body.message;
    if (!message) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Message is required please give the message'
      );
    }
    const result = await NotificationService.sendNotificationToAllUsersOfARole(
      role as string,
      message as string
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Notification sent successfully',
      data: result,
    });
  }
);

export const NotificationController = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  readAllNotification,
  sendNotificationToAllUsers,
};
