import Stripe from 'stripe';
import { Booking } from '../../modules/booking/booking.models';
import { Session } from '../../modules/session/session.models'; // Adjust path as needed

const handleCheckoutExpired = async (session: Stripe.Checkout.Session) => {
  try {
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.warn('No booking ID found in expired checkout session metadata');
      return;
    }

    // Get booking details before deletion (for logging and session cleanup)
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.warn(`Booking not found for expired session: ${bookingId}`);
      return;
    }

    // Store booking details for session cleanup
    const { sessionId, selectedDay, startTime, coachId, userId } = booking;

    // Delete the booking since the session expired
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);

    if (deletedBooking) {
      console.log(`Expired checkout session. Booking deleted: ${bookingId}`);
      console.log(`Booking details: Coach ${coachId}, User ${userId}, Date ${selectedDay}, Time ${startTime}`);
      
      // Optional: Free up the time slot in the session model
      // Uncomment if you track booked slots in your Session model
      
      await Session.updateOne(
        {
          _id: sessionId,
          'dailySessions.selectedDay': selectedDay,
          'dailySessions.timeSlots.startTime12h': startTime,
        },
        {
          $set: {
            'dailySessions.$.timeSlots.$[slot].isBooked': false,
            'dailySessions.$.timeSlots.$[slot].bookedBy': null,
          },
        },
        {
          arrayFilters: [
            { 'slot.startTime12h': startTime },
          ],
        }
      );
      console.log(`Time slot freed: ${selectedDay} at ${startTime}`);
    }
    
  } catch (error) {
    console.error('Error handling checkout expiration:', error);
    throw error;
  }
};

export default handleCheckoutExpired;