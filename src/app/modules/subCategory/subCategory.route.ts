import express from 'express';
import { SubCategoryController } from './subCategory.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SubCategoryValidation } from './subCategory.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN),
  fileUploadHandler(),
  SubCategoryController.createSubCategory
);
router.get('/', SubCategoryController.getAllSubCategorys);
router.get('/:id', SubCategoryController.getSubCategoryById);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN),
  fileUploadHandler(),
  SubCategoryController.updateSubCategory
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN),
  SubCategoryController.deleteSubCategory
);

export const SubCategoryRoutes = router;
        