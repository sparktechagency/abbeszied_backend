import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import settingsRouter from '../modules/settings/setting.route';
import notificationRoutes from '../modules/notification/notification.route';
import { ruleRoutes } from '../modules/rule/rule.routes';
import favouriteRoutes from '../modules/favourite/favourite.route';
import { paymentRoutes } from '../modules/payment/payment.route';
import stripeAccountRoutes from '../modules/stripeAccount/stripeAccount.route';
import contactUsRoutes from '../modules/contactUs/contactUs.route';
import experienceRoutes from '../modules/experience/experience.route';
import sessionRoutes from '../modules/session/session.route';
import galleryRoutes from '../modules/gallery/gallery.route';
import { supportRoutes } from '../modules/support/support.route';
import { reviewRoutes } from '../modules/review/review.router';
import { storeRouter } from '../modules/store/store.route';
import { reportRoutes } from '../modules/report/report.route';
import { chatRoutes } from '../modules/chat/chat.route';
import { messageRoutes } from '../modules/message/message.route';
import bookingRoutes from '../modules/booking/booking.route';

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
  {
    path: '/gallery',
    route: galleryRoutes,
  },
  {
    path: '/support',
    route: supportRoutes,
  },
  {
    path: '/admin/support',
    route: supportRoutes,
  },
  {
    path: '/review',
    route: reviewRoutes,
  },
  {
    path: '/store',
    route: storeRouter,
  },
  {
    path: '/report',
    route: reportRoutes,
  },
  {
    path: '/chat',
    route: chatRoutes,
  },
  {
    path: '/messages',
    route: messageRoutes,
  },
  {
    path: '/booking',
    route: bookingRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
