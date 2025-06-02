import { Request, Response } from 'express';
import Stripe from 'stripe';
import stripe from '../../config/stripe.config';
import config from '../../config';
import { parkingBookingService } from '../booking/booking.service';
import { paymentService } from '../payment/payment.service';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { userService } from '../user/user.service';
import { parkingService } from '../parking/parking.service';
import { notificationService } from '../notification/notification.service';

const webhookHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('Webhook received');
  const sig = req.headers['stripe-signature'];
  const webhookSecret = config.stripe.webhook_secret;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not set');
    res.status(500).send('Webhook secret not configured');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      webhookSecret,
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'checkout.session.async_payment_failed':
        await handleSubscriptionUpdated(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    // Responding after handling the event
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Error handling the event:', err);
    res.status(500).send(`Internal Server Error: ${err.message}`);
  }
};

export default webhookHandler;

// Function for handling a successful payment
const handlePaymentSucceeded = async (session: Stripe.Checkout.Session) => {
  try {
    const {
      userId,
      parkingId,
      bookingStartDate,
      bookingEndtDate,
      checkInTime,
      bookingType,
      vihicleType,
      vihicleModel,
      vihicleLicensePlate,
      perdayPrice,
      totalDays,
      perWeekPrice,
      totalWeeks,
      totalPrice,
    }: any = session.metadata;

    console.log('1');

    const paymentIntent = session.payment_intent as string;

    console.log('paymentIntent : 2');

    const isPaymentExist = await paymentService.isPaymentExist(paymentIntent);

    if (isPaymentExist) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment Already exist');
    }

    console.log('isPaymentExist : 3');

    const { ownerId, revenue } = await userService.isBusinessExist(parkingId);

    const stripeAccountId = ownerId?.stripeConnectedAcount;

    if (!stripeAccountId) {
      throw new AppError(httpStatus.NOT_FOUND, 'Business not found');
    }

    console.log('stripeAccountId : 4');

    const adminParcentage = revenue;

    if (!adminParcentage) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Admin fee percentage not found',
      );
    }

    const adminRevenue = Math.ceil((totalPrice * adminParcentage) / 100);

    const businessRevenue = totalPrice - adminRevenue;

    console.log({ adminParcentage });
    console.log({ adminRevenue });
    console.log({ businessRevenue });
    console.log({ totalPrice });
    console.log('businessRevenue : 5');

    const balance = await stripe.balance.retrieve();

    console.log('balance');
    console.log(balance);

    if (balance?.available?.[0].amount < businessRevenue * 100) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Insufficient funds in admin account for transfer',
      );
    }

    console.log('balance : 6');

    const businessAccount = await stripe.accounts.retrieve(stripeAccountId);

    if (businessAccount?.requirements?.disabled_reason) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Business's stripe account is not enabled: ${businessAccount.requirements.disabled_reason}`,
      );
    }

    console.log('businessAccount : 7');

    const transfer = await stripe.transfers.create({
      amount: Math.floor(businessRevenue * 100),
      currency: 'usd',
      destination: stripeAccountId,
    });

    console.log('transfer : 7');

    // Payout to vendor's external bank account or card
    const externalAccount = await stripe.accounts.listExternalAccounts(
      stripeAccountId,
      { object: 'bank_account' },
    );

    if (!externalAccount.data.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No external bank accounts found for the vendor',
      );
    }

    console.log('externalAccount : 8');

    //   Payment receive business account instant or standard
    await stripe.payouts.create(
      {
        amount: Math.floor(businessRevenue * 100), // Convert to cents
        currency: 'usd',
        destination: externalAccount.data[0].id,
        method: 'standard', // Can change to 'instant' for instant payouts
      },
      { stripeAccount: stripeAccountId },
    );

    console.log('payouts : 9');
    console.log({ bookingStartDate });
    console.log({ checkInTime });
    const newBooking = await parkingBookingService.addParkingBookingService({
      userId,
      parkingId,
      bookingStartDate,
      bookingEndtDate,
      checkInTime,
      bookingType,
      vihicleType,
      vihicleModel,
      vihicleLicensePlate,
      perdayPrice,
      totalDays,
      perWeekPrice,
      totalWeeks,
      totalPrice,
    });

    console.log('newBooking : 10');

    const newPayment = await paymentService.createPaymentService({
      userId,
      bookingId: newBooking._id,
      parkingId,
      businessOwnerId: ownerId?._id,
      adminCommission: adminParcentage,
      adminRevenue,
      paymentIntent,
      totalPrice,
    });

    console.log('newPayment : 11');
    //@ts-ignore
    const io = global.io;
    io.emit(`user::payment::${userId}`, 'Payment Sucessfull');

    io.emit(`business::booking::${ownerId?._id}`, 'New booking payment done.');
    process.nextTick(async () => {
      await notificationService.createNotification({
        userId,
        message: 'Your one time otp for forget password',
        type: 'success',
      });
      await notificationService.createNotification({
        userId: ownerId?._id,
        message: 'Your one time otp for forget password',
        type: 'success',
      });
    });

    return newPayment;
  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error);
  }
};

// Function for handling subscription update or payment failure
const handleSubscriptionUpdated = async (session: Stripe.Checkout.Session) => {
  try {
    console.log(
      `Subscription for user ${session.client_reference_id} updated or payment failed`,
    );
    // Update subscription status in your DB
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
  }
};
