import express from 'express';
import { ArticleController } from './article.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ArticleValidation } from './article.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN];
router.post(
  '/create',
  auth(...rolesOfAccess),
  fileUploadHandler(),
  ArticleController.createArticle
);
router.get('/', ArticleController.getAllArticles);
router.get('/:id', ArticleController.getArticleById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  fileUploadHandler(),
  ArticleController.updateArticle
);
router.delete('/:id', auth(...rolesOfAccess), ArticleController.deleteArticle);

export const ArticleRoutes = router;
