import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { Server } from 'socket.io';
import { NOTIFICATION_STATUS } from './notification.constant';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { IUser } from '../user/user.interface';

const createNotification = async (
  payload: INotification,
  io: Server
): Promise<INotification> => {
  const result = await Notification.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create notification!'
    );
  }
  io.emit(`NEW_NOTIFICATION::${result.reciever}`, result);
  return result;
};

// const getAllNotifications = async (
//   queryFields: Record<string, any>,
//   userId: string
// ): Promise<any> => {
//   const { search, page, limit } = queryFields;
//   const query = search
//     ? {
//         $or: [
//           { title: { $regex: search, $options: 'i' } },
//           { description: { $regex: search, $options: 'i' } },
//           { status: { $regex: search, $options: 'i' } },
//         ],
//       }
//     : {};
//   let queryBuilder = Notification.find(query);

//   if (page && limit) {
//     queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
//   }
//   delete queryFields.search;
//   delete queryFields.page;
//   delete queryFields.limit;
//   queryBuilder.find({ ...queryFields, reciever: userId });
//   const result = await queryBuilder;
//   const unreadCount = await Notification.countDocuments({
//     ...queryFields,
//     status: NOTIFICATION_STATUS.UNREAD,
//     reciever: userId,
//   });
//   return {
//     data: result,
//     unreadCount,
//   };
// };
const getAllNotifications = async (
  queryFields: Record<string, any>,
  userId: string
): Promise<any> => {
  const { search, page, limit } = queryFields;

  const baseQuery: any = {
    reciever: userId,
  };

  if (search) {
    baseQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { status: { $regex: search, $options: 'i' } },
    ];
  }

  // Clean up queryFields to avoid pollution
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;

  let queryBuilder = Notification.find(baseQuery);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }

  const result = await queryBuilder.sort({ createdAt: -1 }); // Sort newest first

  const unreadCount = await Notification.countDocuments({
    reciever: userId,
    status: NOTIFICATION_STATUS.UNREAD,
  });

  return {
    data: result,
    unreadCount,
  };
};

const getNotificationById = async (
  id: string
): Promise<INotification | null> => {
  const result = await Notification.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
  }
  return result;
};

const updateNotification = async (
  id: string,
  payload: INotification
): Promise<INotification | null> => {
  const isExistNotification = await getNotificationById(id);
  if (!isExistNotification) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
  }

  const result = await Notification.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update notification!'
    );
  }
  return result;
};

const deleteNotification = async (
  id: string
): Promise<INotification | null> => {
  const isExistNotification = await getNotificationById(id);
  if (!isExistNotification) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
  }

  const result = await Notification.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to delete notification!'
    );
  }
  return result;
};

const readNotificationFromDB = async (userId: string) => {
  const readAllNotifications = await Notification.updateMany(
    { reciever: userId },
    { $set: { status: NOTIFICATION_STATUS.READ } }
  );
  if (!readAllNotifications) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Notification did not read successfully'
    );
  }
  return { message: 'Message read successfully' };
};

const sendNotificationToAllUsersOfARole = async (
  role: string,
  message: string
) => {
  const allUsers = await User.find({ role });
  //@ts-ignore
  const io = global.io;
  await Promise.all(
    allUsers.map(async (user: IUser) => {
      const notification: INotification = {
        title: 'Admin sent you a message',
        description: message,
        reciever: user._id,
      };
      const createdNotification = await Notification.create(notification);
      if (!createdNotification) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Failed to create notification!'
        );
      }
      io.emit(`NEW_NOTIFICATION::${user._id}`, createdNotification);
    })
  );
  return {
    message: 'message sent successfully',
  };
};

export const NotificationService = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  readNotificationFromDB,
  sendNotificationToAllUsersOfARole,
};
