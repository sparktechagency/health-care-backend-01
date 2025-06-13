import express from 'express';
import { SubscriberController } from './subscriber.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SubscriberValidation } from './subscriber.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN];
router.post(
  '/create',
  validateRequest(SubscriberValidation.createSubscriberZodSchema),
  SubscriberController.createSubscriber
);
router.get('/', SubscriberController.getAllSubscribers);
router.get('/:id', SubscriberController.getSubscriberById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(SubscriberValidation.updateSubscriberZodSchema),
  SubscriberController.updateSubscriber
);
router.delete(
  '/:id',
  auth(...rolesOfAccess),
  SubscriberController.deleteSubscriber
);

export const SubscriberRoutes = router;
