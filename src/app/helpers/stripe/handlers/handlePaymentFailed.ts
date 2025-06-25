import Stripe from 'stripe';
import { Booking } from '../../../modules/booking/booking.models';
import { PaymentStatus } from '../../../modules/booking/booking.interface';

// Handle failed payment
const handlePaymentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error('No booking ID in payment intent metadata');
    return;
  }

  // Update booking status
  await Booking.findByIdAndUpdate(bookingId, {
    paymentStatus: PaymentStatus.FAILED,
  });

  console.log(`Payment failed for booking: ${bookingId}`);
};
export default handlePaymentFailed;
