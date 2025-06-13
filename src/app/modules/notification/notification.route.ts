import express from 'express';
import { NotificationController } from './notification.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { NotificationValidation } from './notification.validation';

const router = express.Router();
const rolesOfAccess = Object.values(USER_ROLES);
router.post(
  '/send',
  auth(...rolesOfAccess),
  validateRequest(NotificationValidation.createNotificationZodSchema),
  NotificationController.createNotification
);
router.post(
  '/send/:role',
  auth(...rolesOfAccess),
  NotificationController.sendNotificationToAllUsers
);
router.get(
  '/',
  auth(...rolesOfAccess),
  NotificationController.getAllNotifications
);
router.get(
  '/:id',
  auth(...rolesOfAccess),
  NotificationController.getNotificationById
);
router.patch(
  '/read',
  auth(...rolesOfAccess),
  NotificationController.readAllNotification
);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(NotificationValidation.updateNotificationZodSchema),
  NotificationController.updateNotification
);
router.delete(
  '/:id',
  auth(...rolesOfAccess),
  NotificationController.deleteNotification
);

export const NotificationRoutes = router;
