
import express from 'express';
import { ShippingController } from './shippingcost.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();


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
router.get(
  '/country',
  auth(USER_ROLES.ADMIN),
  ShippingController.getShippingCostByCountry
);

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  ShippingController.updateShippingCost
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  ShippingController.deleteShippingCost
);


export const ShippingRoutes = router;
