import { Model, Types } from 'mongoose';

export type INotification = {
  title?: string;
  description: string;
  reciever: Types.ObjectId;
  status?: string;
};

export type NotificationModel = Model<INotification>;
