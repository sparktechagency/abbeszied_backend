import Stripe from 'stripe';
import { Booking } from '../../../modules/booking/booking.models';
import { sendNotifications } from '../../sendNotification';
import { User } from '../../../modules/user/user.models';

// Handle canceled payment
const handlePaymentCanceled = async (paymentIntent: Stripe.PaymentIntent) => {
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error('No booking ID in payment intent metadata');
    return;
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    console.error('No booking found with the provided ID');
    return;
  }
  const client = await User.findById(booking?.userId);

  await User.findByIdAndUpdate(booking?.userId, {
    $inc: { totalSpend: -booking!.price },
  });

  // Reverse coach's total earned
  await User.findByIdAndUpdate(booking?.coachId, {
    $inc: { totalEarned: -booking!.price },
  });

  await sendNotifications({
    receiver: booking?.coachId,
    type: 'CANCELLED',
    message: `Your client ${client?.fullName} has canceled the booking`,
  });
  // Delete the booking since payment was canceled
  await Booking.findByIdAndDelete(bookingId);
};
export default handlePaymentCanceled;
