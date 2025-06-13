import express from 'express';
import { DiscountController } from './discount.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DiscountValidation } from './discount.validation';
import { DoctorController } from '../user/doctor/doctor.controller';

const router = express.Router();
const rolesOfAccess = [
  USER_ROLES.ADMIN,
  USER_ROLES.USER,
  USER_ROLES.SUPERADMIN,
];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(DiscountValidation.createDiscountZodSchema),
  DiscountController.createDiscount
);
router.get('/', DiscountController.getAllDiscounts);
router.get('/:id', DiscountController.getDiscountById);

router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(DiscountValidation.updateDiscountZodSchema),
  DiscountController.updateDiscount
);
router.delete(
  '/:id',
  auth(...rolesOfAccess),
  DiscountController.deleteDiscount
);

export const DiscountRoutes = router;
