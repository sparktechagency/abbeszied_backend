import Stripe from 'stripe';
import mongoose from 'mongoose';
import { Booking } from '../../../modules/booking/booking.models';
import {
  BookingStatus,
  PaymentStatus,
} from '../../../modules/booking/booking.interface';
import { Session } from '../../../modules/session/session.models';
import generateOrderNumber from '../../../utils/genereteNumber';
import { sendNotifications } from '../../sendNotification';
import { User } from '../../../modules/user/user.models';
import AppError from '../../../error/AppError';

const handlePaymentSuccess = async (
  checkoutSession: Stripe.Checkout.Session,
) => {
  const bookingId = checkoutSession.metadata?.bookingId;
  const paymentIntentId = checkoutSession.payment_intent as string;

  if (!bookingId) {
    console.error('No booking ID in checkout session metadata');
    return;
  }

  if (!paymentIntentId) {
    console.error('No payment intent ID in checkout session');
    return;
  }

  // Start a database transaction for data consistency
  const session = await mongoose.startSession();
  let booking; // Declare booking variable in outer scope

  try {
    await session.withTransaction(async () => {
      // 1. Update booking status with atomic operation - INCLUDING paymentIntentId
      booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          bookingStatus: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          paymentIntentId: paymentIntentId, // Store payment intent ID for refunds
          orderNumber: generateOrderNumber('ORD#'),
        },
        { new: true, session },
      );

      if (!booking) {
        throw new AppError(404, `Booking not found: ${bookingId}`);
      }

      // 2. Update session time slot atomically
      const sessionUpdateResult = await Session.findOneAndUpdate(
        {
          _id: booking.sessionId,
          'dailySessions.selectedDay': booking.selectedDay,
          'dailySessions.timeSlots.startTime12h': booking.startTime,
        },
        {
          $set: {
            'dailySessions.$[session].timeSlots.$[slot].isBooked': true,
            'dailySessions.$[session].timeSlots.$[slot].clientId':
              booking.userId,
          },
        },
        {
          arrayFilters: [
            { 'session.selectedDay': booking.selectedDay },
            { 'slot.startTime12h': booking.startTime, 'slot.isBooked': false },
          ],
          session,
        },
      );

      if (!sessionUpdateResult) {
        throw new AppError(
          400,
          `Failed to update session or time slot already booked for booking: ${bookingId}`,
        );
      }

      // 3. Update user's total spend atomically (prevents race conditions)
      const updatedUser = await User.findByIdAndUpdate(
        booking.userId,
        { $inc: { totalSpend: booking.price } },
        { session, new: true },
      );

      if (!updatedUser) {
        throw new AppError(404, `User not found: ${booking.userId}`);
      }

      // 4. Update coach's total earned atomically
      const updatedCoach = await User.findByIdAndUpdate(
        booking.coachId,
        { $inc: { totalEarned: booking.price } },
        { session, new: true },
      );

      if (!updatedCoach) {
        throw new AppError(404, `Coach not found: ${booking.coachId}`);
      }

      console.log(`Payment success processed for booking: ${bookingId}, PaymentIntent: ${paymentIntentId}`);
    });

    // 5. Send notification outside transaction to avoid rollback on notification failure
    try {
      const client = await User.findById(booking!.userId).select('fullName');
      await sendNotifications({
        receiver: booking!.coachId,
        type: 'BOOKING',
        message: `You have a new client booking with client ${client?.fullName}`,
      });
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't throw - payment processing was successful
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error; // Re-throw to let caller handle if needed
  } finally {
    await session.endSession();
  }
};

export default handlePaymentSuccess;