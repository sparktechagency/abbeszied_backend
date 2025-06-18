import Stripe from 'stripe';
import { Booking } from '../../../modules/booking/booking.models';
import {
  BookingStatus,
  PaymentStatus,
} from '../../../modules/booking/booking.interface';
import { Session } from '../../../modules/session/session.models';
import generateOrderNumber from '../../../utils/genereteNumber';

// ✅ Updated to use Checkout.Session instead of PaymentIntent
const handlePaymentSuccess = async (
  checkoutSession: Stripe.Checkout.Session,
) => {
  const bookingId = checkoutSession.metadata?.bookingId;

  if (!bookingId) {
    console.error('No booking ID in checkout session metadata');
    return;
  }

  // Update booking status
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      orderNumber: generateOrderNumber('ORD#'),
    },
    { new: true },
  );

  if (!booking) {
    console.error(`Booking not found: ${bookingId}`);
    return;
  }

  // Update session time slot to mark as booked
  await Session.findOneAndUpdate(
    {
      _id: booking.sessionId,
      'dailySessions.selectedDay': booking.selectedDay,
      'dailySessions.timeSlots.startTime12h': booking.startTime,
    },
    {
      $set: {
        'dailySessions.$[session].timeSlots.$[slot].isBooked': true,
        'dailySessions.$[session].timeSlots.$[slot].clientId': booking.userId,
      },
    },
    {
      arrayFilters: [
        { 'session.selectedDay': booking.selectedDay },
        { 'slot.startTime12h': booking.startTime, 'slot.isBooked': false },
      ],
    },
  );
};

export default handlePaymentSuccess;
