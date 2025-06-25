import express from 'express';
import { QuestionController } from './question.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { QuestionValidation } from './question.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(QuestionValidation.createQuestionZodSchema),
  QuestionController.createQuestion
);
router.get('/', QuestionController.getAllQuestions);
router.get('/:id', QuestionController.getQuestionById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(QuestionValidation.updateQuestionZodSchema),
  QuestionController.updateQuestion
);
router.delete(
  '/:id',
  auth(...rolesOfAccess),
  QuestionController.deleteQuestion
);

export const MedicalQuestionRoutes = router;
