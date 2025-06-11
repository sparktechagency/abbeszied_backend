import { Request, Response } from 'express';
import Stripe from 'stripe';
import colors from 'colors';
import config from '../config';
import stripe from '../config/stripe.config';
import AppError from '../error/AppError';
import httpStatus from 'http-status';
import { logger } from '../utils/logger';
import handlePaymentSuccess from './handlers/handlePaymentSuccess';
import handleCheckoutExpired from './handlers/handleCheckoutExpired';
import handlePaymentFailed from './handlers/handlePaymentFailed';

const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = config.stripe.webhook_secret as string;

  let event: Stripe.Event | undefined;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed. ${error}`,
    );
  }

  if (!event) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid event received!');
  }

  const data = event.data.object;
  const eventType = event.type;

  console.log('Received Stripe event:', eventType);

  try {
    switch (eventType) {
      // ✅ Checkout Events
      case 'checkout.session.completed':
        await handlePaymentSuccess(data as Stripe.Checkout.Session);
        break;

      case 'checkout.session.expired':
        await handleCheckoutExpired(data as Stripe.Checkout.Session);
        break;

      // ✅ Payment Events
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(data as Stripe.PaymentIntent);
        break;

      // ✅ Invoice Events (optional)
      case 'invoice.payment_succeeded':
        logger.info('Invoice payment succeeded');
        break;

      case 'invoice.payment_failed':
        logger.warn('Invoice payment failed');
        break;

      default:
        logger.warn(colors.bgGreen.bold(`Unhandled event type: ${eventType}`));
    }
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error handling event: ${error}`,
    );
  }

  res.sendStatus(200);
};

export default handleStripeWebhook;
