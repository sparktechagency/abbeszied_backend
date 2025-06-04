import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import settingsRouter from '../modules/settings/setting.route';
import notificationRoutes from '../modules/notification/notification.route';
import { ruleRoutes } from '../modules/rule/rule.routes';
import { parkingRoutes } from '../modules/parking/parking.route';
import favouriteRoutes from '../modules/favourite/favourite.route';
import reviewRouters from '../modules/ratings/ratings.route';
import { paymentRoutes } from '../modules/payment/payment.route';
import stripeAccountRoutes from '../modules/stripeAccount/stripeAccount.route';
import contactUsRoutes from '../modules/contactUs/contactUs.route';
import experienceRoutes from '../modules/experience/experience.route';
import sessionRoutes from '../modules/session/session.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },
  {
    path: '/rule',
    route: ruleRoutes,
  },
  {
    path: '/parking',
    route: parkingRoutes,
  },
  {
    path: '/favourite',
    route: favouriteRoutes,
  },
  {
    path: '/setting',
    route: settingsRouter,
  },
  {
    path: '/notification',
    route: notificationRoutes,
  },
  {
    path: '/review',
    route: reviewRouters,
  },
  {
    path: '/payment',
    route: paymentRoutes,
  },
  {
    path: '/stripe',
    route: stripeAccountRoutes,
  },
  {
    path: '/contact',
    route: contactUsRoutes,
  },
  {
    path: '/experience',
    route: experienceRoutes,
  },
  {
    path: '/sessions',
    route: sessionRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
