"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* app.ts */
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const handleStripeWebhook_1 = __importDefault(require("./app/helpers/stripe/handleStripeWebhook"));
// Import your other middleware & routers if needed
const globalErrorhandler_1 = __importDefault(require("./app/middleware/globalErrorhandler"));
const notfound_1 = __importDefault(require("./app/middleware/notfound"));
const routes_1 = __importDefault(require("./app/routes"));
const welcome_1 = require("./app/utils/welcome");
const app = (0, express_1.default)();
// View engine setup (optional)
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Stripe webhook endpoint: use express.raw to get raw body required for Stripe signature verification
app.post('/api/v1/stripe/webhook', express_1.default.raw({ type: 'application/json' }), handleStripeWebhook_1.default);
// Serve static files from 'public'
app.use(express_1.default.static('public'));
// Middleware for parsing urlencoded and JSON bodies (non-webhook routes)
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// Cookie parser and CORS setup
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
// Your API routes
app.use('/api/v1', routes_1.default);
// Basic route for testing
app.get('/', (req, res) => {
    res.send((0, welcome_1.welcome)());
});
// Error handling middleware
app.use(globalErrorhandler_1.default);
app.use(notfound_1.default);
exports.default = app;
