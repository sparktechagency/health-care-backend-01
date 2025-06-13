import express from 'express';
import { InfoController } from './info.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { InfoValidation } from './info.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(InfoValidation.createInfoZodSchema),
  InfoController.createInfo
);
router.get('/', InfoController.getAllInfos);
router.get('/:id', InfoController.getInfoById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(InfoValidation.updateInfoZodSchema),
  InfoController.updateInfo
);
router.delete('/:id', auth(...rolesOfAccess), InfoController.deleteInfo);

export const InfoRoutes = router;
