import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { SubCategoryRoutes } from '../app/modules/subCategory/subCategory.route';
import { MedicineRoutes } from '../app/modules/medicine/medicine.route';
import { ShippingDetailsRoutes } from '../app/modules/shippingDetails/shippingDetails.route';
import { DiscountRoutes } from '../app/modules/discount/discount.route';
import { ArticleRoutes } from '../app/modules/article/article.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
import { ConsultationRoutes } from '../app/modules/consultation/consultation.route';
import { AboutRoutes } from '../app/modules/about/about.route';
import { ReviewRoutes } from '../app/modules/review/review.route';
import { InfoRoutes } from '../app/modules/info/info.route';
import { SubscriberRoutes } from '../app/modules/subscriber/subscriber.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { PdfRouter } from '../app/modules/pdf/pdf.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { QuestionRoutes } from '../app/modules/question/question.route';
import { OrderRoutes } from '../app/modules/order/order.route';
import { EuropeConsultationRoutes } from '../app/modules/europe/consultation/consultation.route';
import { AffliatedRoutes } from '../app/modules/europe/affliatedDoctor/affliated.route';
import { MedicalQuestionRoutes } from '../app/modules/question-medical/question.route';
import { ShippingRoutes } from '../app/modules/shipping-cost/shipping.routes';

const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/subcategory',
    route: SubCategoryRoutes,
  },
  {
    path: '/medicine',
    route: MedicineRoutes,
  },
  {
    path: '/shippingdetails',
    route: ShippingDetailsRoutes,
  },
  {
    path: '/discount',
    route: DiscountRoutes,
  },
  {
    path: '/article',
    route: ArticleRoutes,
  },
  {
    path: '/consultation',
    route: ConsultationRoutes,
  },
  {
    path: '/faq',
    route: FaqRoutes,
  },
    {
    path: '/medical-question',
    route: MedicalQuestionRoutes,
  },
  {
    path: '/about',
    route: AboutRoutes,
  },
  {
    path: '/review',
    route: ReviewRoutes,
  },
  {
    path: '/info',
    route: InfoRoutes,
  },
  {
    path: '/subscriber',
    route: SubscriberRoutes,
  },
  {
    path: '/message',
    route: MessageRoutes,
  },
  {
    path: '/pdf',
    route: PdfRouter,
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/question',
    route: QuestionRoutes,
  },
  {
    path: '/order',
    route: OrderRoutes,
  },
  {
    path: '/europe/consultation',
    route: EuropeConsultationRoutes
  },
   {
    path: '/europe/affiliated-doctor',
    route: AffliatedRoutes
  },
    {
    path: '/shipping',
    route: ShippingRoutes
  },
  
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
