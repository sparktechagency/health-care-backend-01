import express from 'express';
import { FaqController } from './faq.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FaqValidation } from './faq.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(FaqValidation.createFaqZodSchema),
  FaqController.createFaq
);
router.get('/', FaqController.getAllFaqs);
router.get('/:id', FaqController.getFaqById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(FaqValidation.updateFaqZodSchema),
  FaqController.updateFaq
);
router.delete('/:id', auth(...rolesOfAccess), FaqController.deleteFaq);

export const FaqRoutes = router;
