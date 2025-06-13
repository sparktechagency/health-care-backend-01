import { Schema, model } from 'mongoose';
import { INotification, NotificationModel } from './notification.interface';
import { NOTIFICATION_STATUS } from './notification.constant';

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    title: { type: String, required: false },
    description: { type: String, required: true },
    reciever: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(NOTIFICATION_STATUS),
      default: NOTIFICATION_STATUS.UNREAD,
      required: false,
    },
  },
  { timestamps: true }
);

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema
);
