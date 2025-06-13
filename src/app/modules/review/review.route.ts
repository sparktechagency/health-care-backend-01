import express from 'express';
import { ReviewController } from './review.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidation } from './review.validation';

const router = express.Router();
const rolesOfAccess = [
  USER_ROLES.ADMIN,
  USER_ROLES.USER,
  USER_ROLES.SUPERADMIN,
];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
);
router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getReviewById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview
);
router.delete('/:id', auth(...rolesOfAccess), ReviewController.deleteReview);

export const ReviewRoutes = router;
