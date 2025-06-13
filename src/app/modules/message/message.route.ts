import express from 'express';
import { MessageController } from './message.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MessageValidation } from './message.validation';

const router = express.Router();
router.post(
  '/send',
  validateRequest(MessageValidation.createMessageZodSchema),
  MessageController.createMessage
);

export const MessageRoutes = router;
