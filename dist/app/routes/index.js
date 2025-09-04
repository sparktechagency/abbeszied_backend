"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otp_routes_1 = require("../modules/otp/otp.routes");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const stripeAccount_route_1 = __importDefault(require("../modules/stripeAccount/stripeAccount.route"));
const experience_route_1 = __importDefault(require("../modules/experience/experience.route"));
const session_route_1 = __importDefault(require("../modules/session/session.route"));
const gallery_route_1 = __importDefault(require("../modules/gallery/gallery.route"));
const support_route_1 = require("../modules/support/support.route");
const review_router_1 = require("../modules/review/review.router");
const store_route_1 = require("../modules/store/store.route");
const report_route_1 = require("../modules/report/report.route");
const chat_route_1 = require("../modules/chat/chat.route");
const message_route_1 = require("../modules/message/message.route");
const booking_route_1 = __importDefault(require("../modules/booking/booking.route"));
const favourit_router_1 = require("../modules/favourit/favourit.router");
const banner_routes_1 = require("../modules/banner/banner.routes");
const jobPost_routes_1 = require("../modules/jobPost/jobPost.routes");
const favouritJobs_router_1 = require("../modules/favourit jobs/favouritJobs.router");
const category_route_1 = require("../modules/category/category.route");
const userManagment_router_1 = require("../modules/userManagment/userManagment.router");
const product_route_1 = require("../modules/productsManagments/product.route");
const certificate_routes_1 = require("../modules/certificateManagments/certificate.routes");
const notification_routes_1 = require("../modules/notification/notification.routes");
const admin_route_1 = require("../modules/admin/admin.route");
const dashboard_route_1 = require("../modules/dashboard/dashboard.route");
const sattings_route_1 = __importDefault(require("../modules/sattings/sattings.route"));
const faq_route_1 = require("../modules/faqs/faq.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/users',
        route: user_route_1.userRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.authRoutes,
    },
    {
        path: '/otp',
        route: otp_routes_1.otpRoutes,
    },
    {
        path: '/favourite',
        route: favourit_router_1.FavouritdRouter,
    },
    {
        path: '/favourite-jobs',
        route: favouritJobs_router_1.FavouritdJobRouter,
    },
    {
        path: '/settings',
        route: sattings_route_1.default,
    },
    {
        path: '/notifications',
        route: notification_routes_1.NotificationRoutes,
    },
    {
        path: '/stripe',
        route: stripeAccount_route_1.default,
    },
    {
        path: '/experience',
        route: experience_route_1.default,
    },
    {
        path: '/sessions',
        route: session_route_1.default,
    },
    {
        path: '/gallery',
        route: gallery_route_1.default,
    },
    {
        path: '/support',
        route: support_route_1.supportRoutes,
    },
    {
        path: '/admin/support',
        route: support_route_1.supportRoutes,
    },
    {
        path: '/review',
        route: review_router_1.reviewRoutes,
    },
    {
        path: '/store',
        route: store_route_1.storeRouter,
    },
    {
        path: '/report',
        route: report_route_1.reportRoutes,
    },
    {
        path: '/chat',
        route: chat_route_1.chatRoutes,
    },
    {
        path: '/messages',
        route: message_route_1.messageRoutes,
    },
    {
        path: '/booking',
        route: booking_route_1.default,
    },
    {
        path: '/banner',
        route: banner_routes_1.BannerRoutes,
    },
    {
        path: '/job',
        route: jobPost_routes_1.JobPostRoutes,
    },
    {
        path: '/category',
        route: category_route_1.CategoryRoutes,
    },
    {
        path: '/user-managments',
        route: userManagment_router_1.UserManagmentsRouter,
    },
    {
        path: '/products-managments',
        route: product_route_1.ProductManagmentsRouter,
    },
    {
        path: '/certificate-managments',
        route: certificate_routes_1.CertificateManagmentsRoutes,
    },
    {
        path: '/admin-managments',
        route: admin_route_1.AdminRoutes,
    },
    {
        path: '/dashboard',
        route: dashboard_route_1.DashboardRoutes,
    },
    {
        path: '/faq',
        route: faq_route_1.FAQRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
