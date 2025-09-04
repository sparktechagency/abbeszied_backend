"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
const config_1 = __importDefault(require("../../config"));
const stripe_config_1 = __importDefault(require("../../config/stripe.config"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const logger_1 = require("../../utils/logger");
const handlePaymentSuccess_1 = __importDefault(require("./handlers/handlePaymentSuccess"));
const handleCheckoutExpired_1 = __importDefault(require("./handlers/handleCheckoutExpired"));
const handlePaymentFailed_1 = __importDefault(require("./handlers/handlePaymentFailed"));
const handleStripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = config_1.default.stripe.webhook_secret;
    let event;
    try {
        event = stripe_config_1.default.webhooks.constructEvent(req.body, signature, webhookSecret);
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Webhook signature verification failed. ${error}`);
    }
    if (!event) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid event received!');
    }
    const data = event.data.object;
    const eventType = event.type;
    console.log('Received Stripe event:', eventType);
    try {
        switch (eventType) {
            // ✅ Checkout Events
            case 'checkout.session.completed':
                yield (0, handlePaymentSuccess_1.default)(data);
                break;
            case 'checkout.session.expired':
                yield (0, handleCheckoutExpired_1.default)(data);
                break;
            // ✅ Payment Events
            case 'payment_intent.payment_failed':
                yield (0, handlePaymentFailed_1.default)(data);
                break;
            // ✅ Invoice Events (optional)
            case 'invoice.payment_succeeded':
                logger_1.logger.info('Invoice payment succeeded');
                break;
            case 'invoice.payment_failed':
                logger_1.logger.warn('Invoice payment failed');
                break;
            default:
                logger_1.logger.warn(colors_1.default.bgGreen.bold(`Unhandled event type: ${eventType}`));
        }
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Error handling event: ${error}`);
    }
    res.sendStatus(200);
});
exports.default = handleStripeWebhook;
