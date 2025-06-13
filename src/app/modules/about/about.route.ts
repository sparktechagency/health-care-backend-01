import express from 'express';
import { AboutController } from './about.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AboutValidation } from './about.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN];
router.post(
  '/create',
  auth(...rolesOfAccess),
  fileUploadHandler(),
  AboutController.createAbout
);
router.get('/', AboutController.getAllAbouts);
router.get('/:id', AboutController.getAboutById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  fileUploadHandler(),
  AboutController.updateAbout
);
router.delete('/:id', auth(...rolesOfAccess), AboutController.deleteAbout);

export const AboutRoutes = router;
