// src/app/modules/shippingCost/shippingCost.routes.ts
import express from 'express';
import { ShippingController } from './shippingcost.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

const rolesOfAccess = [
  USER_ROLES.ADMIN,
  USER_ROLES.SUPERADMIN,
  USER_ROLES.USER,
];

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  ShippingController.createShippingCost
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN),
  ShippingController.getAllShippingCosts
);

export const ShippingRoutes = router;
