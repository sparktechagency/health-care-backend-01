import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { AdminRoutes } from './admins/admin.route';
import { DoctorRoutes } from './doctor/doctor.route';
import { PharmecyRoutes } from './pharmecy/pharmecy.route';
const router = express.Router();
const rolesOfAccess = [
  USER_ROLES.ADMIN,
  USER_ROLES.USER,
  USER_ROLES.DOCTOR,
  USER_ROLES.PHARMACY,
  USER_ROLES.SUPERADMIN,
  USER_ROLES.USER,
];
router.get('/profile', auth(...rolesOfAccess), UserController.getUserProfile);
router.post(
  '/add-country',
  UserController.addCountryToUser
);
router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  )
  .patch(
    auth(...rolesOfAccess),
    fileUploadHandler(),
    UserController.updateProfile
  );
router.patch(
  '/lock/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN),
  UserController.lockUser
);
router.get(
  '/all',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN),
  UserController.getAllUsers
);
router.use('/admins', AdminRoutes);
router.use('/doctors', DoctorRoutes);
router.use('/pharmecy', PharmecyRoutes);
export const UserRoutes = router;
