import express from 'express';
import { CategoryController } from './category.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN),
  fileUploadHandler(),
  CategoryController.createCategory
);
router.get('/', CategoryController.getAllCategorys);
router.get('/:id', CategoryController.getCategoryById);
router.patch(
  '/:id',
  fileUploadHandler(),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN),
  CategoryController.updateCategory
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN),
  CategoryController.deleteCategory
);
export const CategoryRoutes = router;
