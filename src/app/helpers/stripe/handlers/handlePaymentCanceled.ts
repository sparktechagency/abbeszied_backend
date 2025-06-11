import Stripe from 'stripe';
import { Booking } from '../../../modules/booking/booking.models';

// Handle canceled payment
const handlePaymentCanceled = async (paymentIntent: Stripe.PaymentIntent) => {
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error('No booking ID in payment intent metadata');
    return;
  }

  // Delete the booking since payment was canceled
  await Booking.findByIdAndDelete(bookingId);

  console.log(`Payment canceled, booking deleted: ${bookingId}`);
};
export default handlePaymentCanceled;
