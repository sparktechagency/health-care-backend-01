import express from 'express';
import { OrderController } from './order.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { OrderValidation } from './order.validation';
import multer from 'multer';

const router = express.Router();
const rolesOfAccess = [
  USER_ROLES.ADMIN,
  USER_ROLES.SUPERADMIN,
  USER_ROLES.PHARMACY,
];
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(OrderValidation.createOrderZodSchema),
  OrderController.createOrder
);
router.post('/import', upload.single('file'), OrderController.importOrders);
router.get('/export', OrderController.exportOrders);
router.get('/', OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(OrderValidation.updateOrderZodSchema),
  OrderController.updateOrder
);
router.delete('/:id', auth(...rolesOfAccess), OrderController.deleteOrder);

export const OrderRoutes = router;
