import express from 'express';
import { ShippingDetailsController } from './shippingDetails.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ShippingDetailsValidation } from './shippingDetails.validation';

const router = express.Router();
const rolesOfAccess = [
  USER_ROLES.ADMIN,
  USER_ROLES.PHARMACY,
  USER_ROLES.SUPERADMIN,
  USER_ROLES.DOCTOR,
];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(ShippingDetailsValidation.createShippingDetailsZodSchema),
  ShippingDetailsController.createShippingDetails
);
router.get('/', ShippingDetailsController.getAllShippingDetailss);
router.get('/:id', ShippingDetailsController.getShippingDetailsById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(ShippingDetailsValidation.updateShippingDetailsZodSchema),
  ShippingDetailsController.updateShippingDetails
);
router.delete(
  '/:id',
  auth(...rolesOfAccess),
  ShippingDetailsController.deleteShippingDetails
);

export const ShippingDetailsRoutes = router;
