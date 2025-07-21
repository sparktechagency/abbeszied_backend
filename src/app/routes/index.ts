import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import stripeAccountRoutes from '../modules/stripeAccount/stripeAccount.route';
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
import { FavouritdRouter } from '../modules/favourit/favourit.router';
import { BannerRoutes } from '../modules/banner/banner.routes';
import { JobPostRoutes } from '../modules/jobPost/jobPost.routes';
import { FavouritdJobRouter } from '../modules/favourit jobs/favouritJobs.router';
import { CategoryRoutes } from '../modules/category/category.route';
import { UserManagmentsRouter } from '../modules/userManagment/userManagment.router';
import { ProductManagmentsRouter } from '../modules/productsManagments/product.route';
import { CertificateManagmentsRoutes } from '../modules/certificateManagments/certificate.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { AdminRoutes } from '../modules/admin/admin.route';
import { DashboardRoutes } from '../modules/dashboard/dashboard.route';
import SettingsRouter from '../modules/sattings/sattings.route';
import { FAQRoutes } from '../modules/faqs/faq.route';

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
    path: '/favourite',
    route: FavouritdRouter,
  },
  {
    path: '/favourite-jobs',
    route: FavouritdJobRouter,
  },
  {
    path: '/settings',
    route: SettingsRouter,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/stripe',
    route: stripeAccountRoutes,
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
  {
    path: '/banner',
    route: BannerRoutes,
  },
  {
    path: '/job',
    route: JobPostRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/user-managments',
    route: UserManagmentsRouter,
  },
  {
    path: '/products-managments',
    route: ProductManagmentsRouter,
  },
  {
    path: '/certificate-managments',
    route: CertificateManagmentsRoutes,
  },
  {
    path: '/admin-managments',
    route: AdminRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/faq',
    route: FAQRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
