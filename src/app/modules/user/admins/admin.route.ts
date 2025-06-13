import { Router } from 'express';
import { AdminController } from './admin.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
const router = Router();
router.post(
  '/',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  validateRequest(AdminValidation.createAdminZodSchema),
  AdminController.addAdmin
);
router.get(
  '/all',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  AdminController.getAllAdmins
);
router.get(
  '/status',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  AdminController.getWebsiteStatus
);

router.get(
  '/earning/status',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  AdminController.getEarningStatus
);
router.get(
  '/users/status',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  AdminController.getMonthlyUserCount
);
router.get(
  '/workload/status',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  AdminController.getMonthlyWorkLoad
);
router.get(
  '/:id',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  AdminController.getSingleAdmin
);
router.patch('/:id', auth(USER_ROLES.SUPERADMIN), AdminController.updateAdmin);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  AdminController.deleteAdmin
);
export const AdminRoutes = router;
