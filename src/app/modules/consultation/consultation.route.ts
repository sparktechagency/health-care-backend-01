import express from 'express';
import { ConsultationValidation } from './consultation.validation';
import { ConsultationController } from './consultation.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { ConsultationService } from './consultation.service';
const router = express.Router();
const rolesOfAccess = [
  USER_ROLES.ADMIN,
  USER_ROLES.SUPERADMIN,
  USER_ROLES.USER,
];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(ConsultationValidation.createConsultationZodSchema),
  ConsultationController.createConsultation
);
router.get(
  '/create/success',
  // auth(...rolesOfAccess),
  ConsultationController.createConsultationSuccess
);
router.post(
  '/withdraw',
  auth(USER_ROLES.DOCTOR),
  ConsultationController.withdrawDoctorMoney
);
router.post(
  '/reject/:id',
  auth(...rolesOfAccess, USER_ROLES.DOCTOR, USER_ROLES.PHARMACY),
  ConsultationController.rejectConsultation
);
router.post(
  '/buyMedicine/:id',
  auth(USER_ROLES.USER),
  ConsultationController.buyMedicine
);
router.get('/buySuccess', ConsultationController.buyMedicineSuccess);
router.get(
  '/my',
  auth(...rolesOfAccess, USER_ROLES.DOCTOR),
  ConsultationController.getMyConsultations
);
router.get(
  '/all',
  auth(...rolesOfAccess, USER_ROLES.DOCTOR, USER_ROLES.PHARMACY),
  ConsultationController.getAllConsultations
);
router.get(
  '/:id',
  auth(...rolesOfAccess, USER_ROLES.DOCTOR, USER_ROLES.PHARMACY),
  ConsultationController.getConsultationByID
);
router.get(
  '/refund/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN),
  ConsultationController.refundMoney
);

router.patch(
  '/:id',
  auth(
    USER_ROLES.DOCTOR,
    USER_ROLES.SUPERADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.PHARMACY
  ),
  fileUploadHandler(),
  ConsultationController.updateConsultation
);
router.patch(
  '/prescribe/:id',
  auth(USER_ROLES.DOCTOR),
  ConsultationController.prescribeMedicine
);
router.patch(
  '/schedule/:id',
  auth(USER_ROLES.DOCTOR),
  ConsultationController.scheduleConsultation
);
router.patch(
  '/link/:id',
  auth(USER_ROLES.DOCTOR),
  ConsultationController.addLink
);
export const ConsultationRoutes = router;
