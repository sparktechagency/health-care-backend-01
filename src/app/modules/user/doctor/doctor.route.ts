import { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { DoctorValidation } from './doctor.validation';
import { DoctorController } from './doctor.controller';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';

const router = Router();
router.get(
  '/status',
  auth(USER_ROLES.DOCTOR),
  DoctorController.getDoctorStatus
);
router.get(
  '/activity/status',
  auth(USER_ROLES.DOCTOR),
  DoctorController.getDoctorActivityStatus
);

router.get(
  '/earning/status',
  auth(USER_ROLES.DOCTOR),
  DoctorController.getDoctorEarningStatus
);
router.get(
  '/earnings',
  auth(USER_ROLES.DOCTOR),
  DoctorController.getDoctorEarnings
);
router.get(
  '/earning-history',
  auth(USER_ROLES.DOCTOR),
  DoctorController.getDoctorEarningHistory
);
router.post(
  '/',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  validateRequest(DoctorValidation.createDoctorZodSchema),
  DoctorController.addDoctor
);
router.post(
  '/setup-payment',
  auth(USER_ROLES.DOCTOR),
  fileUploadHandler(),
  DoctorController.setUpStripeConnectAccount
);
router.get(
  '/all',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  DoctorController.getAllDoctors
);

router.get(
  '/:id',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  DoctorController.getSingleDoctor
);

router.delete(
  '/:id',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  DoctorController.deleteDoctor
);
export const DoctorRoutes = router;
