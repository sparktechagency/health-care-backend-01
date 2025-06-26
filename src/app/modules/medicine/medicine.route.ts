import express from 'express';
import { MedicineController } from './medicine.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MedicineValidation } from './medicine.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();
const roleOfAccess = [
  USER_ROLES.ADMIN,
  USER_ROLES.DOCTOR,
  USER_ROLES.PHARMACY,
  USER_ROLES.SUPERADMIN,
];
router.post(
  '/create',
  auth(...roleOfAccess),
  fileUploadHandler(),
  MedicineController.createMedicine
);
router.get('/', MedicineController.getAllMedicines);
router.get('/:id', MedicineController.getMedicineById);
router.get('/user-medicine/:userId', MedicineController.getUserMedicinesController)
router.patch(
  '/:id',
  auth(...roleOfAccess),
  fileUploadHandler(),
  MedicineController.updateMedicine
);
router.delete('/:id', auth(...roleOfAccess), MedicineController.deleteMedicine);

export const MedicineRoutes = router;
