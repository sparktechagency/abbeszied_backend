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
exports.bookingService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("../user/user.models");
const mongoose_1 = require("mongoose");
const session_models_1 = require("../session/session.models");
const booking_interface_1 = require("./booking.interface");
const booking_models_1 = require("./booking.models");
const stripe_config_1 = __importDefault(require("../../config/stripe.config"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const sendNotification_1 = require("../../helpers/sendNotification");
// Helper function to convert 24-hour format to 12-hour format
const convertTo12Hour = (time24h) => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};
// Helper function to get expected session count based on package type
// const getExpectedSessionCount = (sessionPackage: SessionType): number => {
//   switch (sessionPackage) {
//     case SessionType.TRIAL:
//       return 1;
//     case SessionType.SESSION_4:
//       return 4;
//     case SessionType.SESSION_8:
//       return 8;
//     case SessionType.SESSION_12:
//       return 12;
//     default:
//       throw new AppError(httpStatus.BAD_REQUEST, 'Invalid session package');
//   }
// };
// Helper function to generate product name
// const getProductName = (sessionPackage: SessionType, coachName: string, sessionCount: number): string => {
//   switch (sessionPackage) {
//     case SessionType.TRIAL:
//       return `Trial Coaching Session with ${coachName}`;
//     case SessionType.SESSION_4:
//     case SessionType.SESSION_8:
//     case SessionType.SESSION_12:
//       return `${sessionCount}-Session Coaching Package with ${coachName}`;
//     default:
//       return `Coaching Session with ${coachName}`;
//   }
// };
// Helper function to generate product description
// const getProductDescription = (sessionPackage: SessionType, sessions: ISessionSlot[]): string => {
//   if (sessionPackage === SessionType.TRIAL) {
//     const session = sessions[0];
//     return `Trial session on ${new Date(session.selectedDay).toLocaleDateString()} from ${session.startTime} to ${session.endTime}`;
//   }
//   const sessionDates = sessions.map(s =>
//     `${new Date(s.selectedDay).toLocaleDateString()} (${s.startTime}-${s.endTime})`
//   ).join(', ');
//   return `${sessions.length} coaching sessions scheduled for: ${sessionDates}`;
// };
// // Helper function to get package session count
// const getPackageSessionCount = (packageType: SessionPackage): number => {
//   const packageCounts = {
//     [SessionPackage.SINGLE]: 1,
//     [SessionPackage.PACKAGE_4]: 4,
//     [SessionPackage.PACKAGE_8]: 8,
//     [SessionPackage.PACKAGE_12]: 12
//   };
//   return packageCounts[packageType] || 1;
// };
// Create payment intent and temporary booking
const createPaymentIntent = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate session exists
    const session = yield session_models_1.Session.findById(payload.sessionId);
    if (!session) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Session not found');
    }
    // Validate coach exists
    const coach = yield user_models_1.User.findById(payload.coachId);
    if (!coach) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Coach not found');
    }
    // Validate user exists
    const user = yield user_models_1.User.findById(payload.userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Convert time to 24-hour format if needed
    // let startTime24h = payload.startTime;
    // if (
    //   payload.startTime.toLowerCase().includes('am') ||
    //   payload.startTime.toLowerCase().includes('pm')
    // ) {
    //   startTime24h = convertTo24Hour(payload.startTime);
    // }
    // Check if time slot is available
    const isSlotAvailable = yield session_models_1.Session.findOne({
        _id: payload.sessionId,
        coachId: new mongoose_1.Types.ObjectId(payload.coachId),
        'dailySessions.selectedDay': new Date(payload.selectedDay),
        'dailySessions.timeSlots.startTime12h': payload.startTime,
        'dailySessions.timeSlots.isBooked': false,
    });
    if (!isSlotAvailable) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Time slot not available or already booked');
    }
    // Check if there's already a pending booking for this slot
    const existingBooking = yield booking_models_1.Booking.findOne({
        coachId: new mongoose_1.Types.ObjectId(payload.coachId),
        selectedDay: new Date(payload.selectedDay),
        startTime: payload.startTime,
        bookingStatus: { $in: [booking_interface_1.BookingStatus.PENDING, booking_interface_1.BookingStatus.CONFIRMED] },
    });
    if (existingBooking) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Time slot already has a pending or confirmed booking');
    }
    // Create temporary booking
    const booking = yield booking_models_1.Booking.create({
        sessionId: payload.sessionId,
        coachId: payload.coachId,
        userId: payload.userId,
        selectedDay: new Date(payload.selectedDay),
        startTime: payload.startTime,
        endTime: payload.endTime,
        price: payload.price,
        bookingStatus: booking_interface_1.BookingStatus.PENDING,
        paymentStatus: booking_interface_1.PaymentStatus.PENDING,
    });
    // Create Stripe Checkout Session
    // Wrap your Stripe session creation with better error handling
    try {
        const session = yield stripe_config_1.default.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Coaching Session with ${coach.fullName}`,
                        },
                        unit_amount: Math.round(payload.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
            success_url: `${process.env.STRIPE_SUCCESS_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.STRIPE_CANCLE_URL}/booking-cancelled`,
            metadata: {
                bookingId: booking._id.toString(),
                userId: payload.userId,
                coachId: payload.coachId,
                sessionId: payload.sessionId,
                selectedDay: payload.selectedDay,
                startTime: payload.startTime,
            },
        });
        // Update booking with checkout session ID
        yield booking_models_1.Booking.findByIdAndUpdate(booking._id, {
            checkoutSessionId: session.id,
        });
        return {
            booking,
            checkoutUrl: session.url,
            checkoutSessionId: session.id,
        };
    }
    catch (stripeError) {
        // Log the actual Stripe error
        console.error('Stripe Error Details:', {
            type: stripeError.type,
            code: stripeError.code,
            message: stripeError.message,
            param: stripeError.param,
            statusCode: stripeError.statusCode,
        });
        // Clean up temporary booking
        yield booking_models_1.Booking.findByIdAndDelete(booking._id);
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Stripe Error: ${stripeError.message || 'Failed to create checkout session'}`);
    }
});
// const createPaymentIntent = async (
//   payload: ICreateBookingPayload & { userId: string },
// ) => {
//   // Validate session exists
//   const session = await Session.findById(payload.sessionId);
//   if (!session) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Session not found');
//   }
//   // Validate coach exists
//   const coach = await User.findById(payload.coachId);
//   if (!coach) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Coach not found');
//   }
//   // Validate user exists
//   const user = await User.findById(payload.userId);
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   // Validate session package and sessions count
//   const expectedSessionCount = getExpectedSessionCount(payload.sessionPackage);
//   if (payload.sessionTimes.length !== expectedSessionCount) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       `${payload.sessionPackage} requires exactly ${expectedSessionCount} session(s), but ${payload.sessionTimes.length} provided`
//     );
//   }
//   // Validate all time slots are available
//   const unavailableSlots: string[] = [];
//   for (const sessionSlot of payload.sessionTimes) {
//     const isSlotAvailable = await Session.findOne({
//       _id: payload.sessionId,
//       coachId: new Types.ObjectId(payload.coachId),
//       'dailySessions.selectedDay': new Date(sessionSlot.selectedDay),
//       'dailySessions.timeSlots.startTime12h': sessionSlot.startTime,
//       'dailySessions.timeSlots.isBooked': false,
//     });
//     if (!isSlotAvailable) {
//       unavailableSlots.push(`${sessionSlot.selectedDay} at ${sessionSlot.startTime}`);
//     }
//     // Check for existing bookings
//     const existingBooking = await Booking.findOne({
//       coachId: new Types.ObjectId(payload.coachId),
//       selectedDay: new Date(sessionSlot.selectedDay),
//       startTime: sessionSlot.startTime,
//       bookingStatus: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
//     });
//     if (existingBooking) {
//       unavailableSlots.push(`${sessionSlot.selectedDay} at ${sessionSlot.startTime} (already booked)`);
//     }
//   }
//   if (unavailableSlots.length > 0) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       `The following time slots are not available: ${unavailableSlots.join(', ')}`
//     );
//   }
//   // Create bookings for all sessions
//   const createdBookings = [];
//   try {
//     for (const sessionSlot of payload.sessionTimes) {
//       const booking = await Booking.create({
//         sessionId: payload.sessionId,
//         coachId: payload.coachId,
//         userId: payload.userId,
//         selectedDay: new Date(sessionSlot.selectedDay),
//         startTime: sessionSlot.startTime,
//         endTime: sessionSlot.endTime,
//         price: payload.sessionPackage === SessionType.TRIAL ? payload.price : payload.price / payload.sessionTimes.length, // Distribute price for packages
//         sessionPackage: payload.sessionPackage,
//         bookingStatus: BookingStatus.PENDING,
//         paymentStatus: PaymentStatus.PENDING,
//       });
//       createdBookings.push(booking);
//     }
//     // Create Stripe Checkout Session
//     const stripeSession = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: getProductName(payload.sessionPackage, coach.fullName, payload.sessionTimes.length),
//               description: getProductDescription(payload.sessionPackage, payload.sessionTimes),
//             },
//             unit_amount: Math.round(payload.price * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
//       success_url: `${process.env.STRIPE_SUCCESS_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.STRIPE_CANCLE_URL}/booking-cancelled`,
//       metadata: {
//         bookingIds: createdBookings.map(b => b._id!.toString()).join(','),
//         userId: payload.userId,
//         coachId: payload.coachId,
//         sessionId: payload.sessionId,
//         sessionPackage: payload.sessionPackage,
//         sessionCount: payload.sessionTimes.length.toString(),
//       },
//     });
//     // Update all bookings with checkout session ID
//     await Promise.all(
//       createdBookings.map(booking =>
//         Booking.findByIdAndUpdate(booking._id, {
//           checkoutSessionId: stripeSession.id,
//         })
//       )
//     );
//     return {
//       bookings: createdBookings,
//       checkoutUrl: stripeSession.url,
//       checkoutSessionId: stripeSession.id,
//       sessionPackage: payload.sessionPackage,
//       totalSessions: payload.sessionTimes.length,
//     };
//   } catch (stripeError: any) {
//     // Log the actual Stripe error
//     console.error('Stripe Error Details:', {
//       type: stripeError.type,
//       code: stripeError.code,
//       message: stripeError.message,
//       param: stripeError.param,
//       statusCode: stripeError.statusCode,
//     });
//     // Clean up all temporary bookings
//     await Promise.all(
//       createdBookings.map(booking => Booking.findByIdAndDelete(booking._id))
//     );
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       `Stripe Error: ${stripeError.message || 'Failed to create checkout session'}`,
//     );
//   }
// };
// Reschedule booking
const rescheduleBooking = (bookingId, userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { newSelectedDay, newStartTime, newEndTime, reason } = payload;
    // Find the existing booking
    const existingBooking = yield booking_models_1.Booking.findOne({
        _id: bookingId,
        userId: new mongoose_1.Types.ObjectId(userId),
    });
    if (!existingBooking) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Booking not found');
    }
    // Check if booking can be rescheduled
    if (existingBooking.bookingStatus === booking_interface_1.BookingStatus.CANCELLED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot reschedule cancelled booking');
    }
    if (existingBooking.bookingStatus === booking_interface_1.BookingStatus.COMPLETED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot reschedule completed booking');
    }
    if (existingBooking.paymentStatus !== booking_interface_1.PaymentStatus.PAID) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot reschedule unpaid booking');
    }
    // Check if current booking is within 24 hours (no reschedule allowed)
    const currentBookingDateTime = new Date(existingBooking.selectedDay);
    const [currentHours, currentMinutes] = existingBooking.startTime.split(':');
    currentBookingDateTime.setHours(parseInt(currentHours), parseInt(currentMinutes));
    const now = new Date();
    const timeDifferenceFromCurrent = currentBookingDateTime.getTime() - now.getTime();
    const hoursUntilCurrentBooking = timeDifferenceFromCurrent / (1000 * 60 * 60);
    if (hoursUntilCurrentBooking < 24 && hoursUntilCurrentBooking > 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot reschedule booking within 24 hours of scheduled time');
    }
    // Check if new booking time is at least 24 hours from now
    const newBookingDateTime = new Date(newSelectedDay);
    const [newHours, newMinutes] = newStartTime.split(':');
    newBookingDateTime.setHours(parseInt(newHours), parseInt(newMinutes));
    const timeDifferenceToNew = newBookingDateTime.getTime() - now.getTime();
    const hoursUntilNewBooking = timeDifferenceToNew / (1000 * 60 * 60);
    if (hoursUntilNewBooking < 24) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'New booking time must be at least 24 hours from now');
    }
    // Validate that the new time slot is available
    const isNewSlotAvailable = yield session_models_1.Session.findOne({
        _id: existingBooking.sessionId,
        coachId: existingBooking.coachId,
        'dailySessions.selectedDay': new Date(newSelectedDay),
        'dailySessions.timeSlots.startTime12h': newStartTime,
        'dailySessions.timeSlots.isBooked': false,
    });
    if (!isNewSlotAvailable) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'New time slot is not available or already booked');
    }
    // Check if there's already a booking for the new slot
    const conflictingBooking = yield booking_models_1.Booking.findOne({
        coachId: existingBooking.coachId,
        selectedDay: new Date(newSelectedDay),
        startTime: newStartTime,
        bookingStatus: { $in: [booking_interface_1.BookingStatus.PENDING, booking_interface_1.BookingStatus.CONFIRMED] },
        _id: { $ne: bookingId }, // Exclude current booking
    });
    if (conflictingBooking) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'New time slot already has a booking');
    }
    // Start transaction to ensure atomicity
    const session = yield booking_models_1.Booking.startSession();
    session.startTransaction();
    try {
        // Free up the old time slot
        yield session_models_1.Session.findOneAndUpdate({
            _id: existingBooking.sessionId,
            'dailySessions.selectedDay': existingBooking.selectedDay,
            'dailySessions.timeSlots.startTime12h': existingBooking.startTime,
        }, {
            $set: {
                'dailySessions.$[session].timeSlots.$[slot].isBooked': false,
            },
            $unset: {
                'dailySessions.$[session].timeSlots.$[slot].clientId': '',
            },
        }, {
            arrayFilters: [
                { 'session.selectedDay': existingBooking.selectedDay },
                { 'slot.startTime12h': existingBooking.startTime },
            ],
            session,
        });
        // Book the new time slot
        yield session_models_1.Session.findOneAndUpdate({
            _id: existingBooking.sessionId,
            'dailySessions.selectedDay': new Date(newSelectedDay),
            'dailySessions.timeSlots.startTime12h': newStartTime,
        }, {
            $set: {
                'dailySessions.$[session].timeSlots.$[slot].isBooked': true,
                'dailySessions.$[session].timeSlots.$[slot].clientId': userId,
            },
        }, {
            arrayFilters: [
                { 'session.selectedDay': new Date(newSelectedDay) },
                { 'slot.startTime12h': newStartTime },
            ],
            session,
        });
        // Update the booking with new details
        const updatedBooking = yield booking_models_1.Booking.findByIdAndUpdate(bookingId, {
            selectedDay: new Date(newSelectedDay),
            startTime: newStartTime,
            endTime: newEndTime,
            rescheduleReason: reason,
            isRescheduled: true,
            rescheduleCount: (existingBooking.rescheduleCount || 0) + 1,
            lastRescheduledAt: new Date(),
        }, { new: true, session });
        const client = yield user_models_1.User.findById(existingBooking.userId);
        yield (0, sendNotification_1.sendNotifications)({
            receiver: existingBooking.coachId,
            type: 'RESCHEDULED',
            message: `Your client ${client === null || client === void 0 ? void 0 : client.fullName} has rescheduled the session`,
        });
        yield session.commitTransaction();
        return Object.assign(Object.assign({}, updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.toObject()), { startTime12h: convertTo12Hour((updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.startTime) || ''), endTime12h: convertTo12Hour((updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.endTime) || '') });
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
// Get user bookings
const getUserBookings = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { userId: new mongoose_1.Types.ObjectId(userId) };
    const queryBuilder = new QueryBuilder_1.default(booking_models_1.Booking.find(filter)
        .populate('coachId', 'fullName email image')
        .populate('sessionId', 'language pricePerSession')
        .select('coachId selectedDay startTime endTime sessionStatus sessionId paymentStatus bookingStatus'), query);
    const bookings = yield queryBuilder
        .fields()
        .filter()
        .paginate()
        .sort()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    // Convert times to 12-hour format for display
    const bookingsWithFormattedTime = bookings.map((booking) => (Object.assign(Object.assign({}, booking.toObject()), { startTime12h: booking.startTime, endTime12h: booking.endTime })));
    return {
        bookings: bookingsWithFormattedTime,
        meta,
    };
});
// Get coach bookings
const getCoachBookings = (coachId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { coachId: new mongoose_1.Types.ObjectId(coachId) };
    const queryBuilder = new QueryBuilder_1.default(booking_models_1.Booking.find(filter)
        .populate('userId', 'fullName email image')
        .populate('sessionId', 'language pricePerSession'), query);
    const bookings = yield queryBuilder
        .fields()
        .filter()
        .paginate()
        .sort()
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    // Convert times to 12-hour format for display
    const bookingsWithFormattedTime = bookings.map((booking) => (Object.assign(Object.assign({}, booking.toObject()), { startTime12h: booking.startTime, endTime12h: booking.endTime })));
    return {
        bookings: bookingsWithFormattedTime,
        meta,
    };
});
// Get single booking
const getBookingById = (bookingId, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { _id: bookingId };
    // Add role-based filtering
    if (userRole === 'CLIENT') {
        filter.userId = new mongoose_1.Types.ObjectId(userId);
    }
    else if (userRole === 'COACH') {
        filter.coachId = new mongoose_1.Types.ObjectId(userId);
    }
    const booking = yield booking_models_1.Booking.findOne(filter)
        .populate('coachId', 'name email profileImage')
        .populate('userId', 'name email profileImage')
        .populate('sessionId', 'language pricePerSession');
    if (!booking) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Booking not found');
    }
    return Object.assign(Object.assign({}, booking.toObject()), { startTime12h: convertTo12Hour(booking.startTime), endTime12h: convertTo12Hour(booking.endTime) });
});
// Cancel booking
const cancelBooking = (bookingId, userId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_models_1.Booking.findOne({
        _id: bookingId,
        userId: new mongoose_1.Types.ObjectId(userId),
    });
    if (!booking) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Booking not found');
    }
    if (booking.bookingStatus === booking_interface_1.BookingStatus.CANCELLED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Booking already cancelled');
    }
    if (booking.bookingStatus === booking_interface_1.BookingStatus.COMPLETED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot cancel completed booking');
    }
    // Check if booking is within 24 hours
    const bookingDateTime = new Date(booking.selectedDay);
    const [hours, minutes] = booking.startTime.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
    const now = new Date();
    const timeDifference = bookingDateTime.getTime() - now.getTime();
    const hoursUntilBooking = timeDifference / (1000 * 60 * 60);
    if (hoursUntilBooking < 24) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot cancel booking within 24 hours of scheduled time');
    }
    // Update booking status
    const updatedBooking = yield booking_models_1.Booking.findByIdAndUpdate(bookingId, {
        bookingStatus: booking_interface_1.BookingStatus.CANCELLED,
        cancellationReason: reason,
    }, { new: true });
    // Free up the time slot
    yield session_models_1.Session.findOneAndUpdate({
        _id: booking.sessionId,
        'dailySessions.selectedDay': booking.selectedDay,
        'dailySessions.timeSlots.startTime': booking.startTime,
    }, {
        $set: {
            'dailySessions.$[session].timeSlots.$[slot].isBooked': false,
        },
        $unset: {
            'dailySessions.$[session].timeSlots.$[slot].clientId': '',
        },
    }, {
        arrayFilters: [
            { 'session.selectedDay': booking.selectedDay },
            { 'slot.startTime': booking.startTime },
        ],
    });
    // Process refund if payment was made
    if (booking.paymentStatus === booking_interface_1.PaymentStatus.PAID && booking.paymentIntentId) {
        try {
            yield stripe_config_1.default.refunds.create({
                payment_intent: booking.paymentIntentId,
                reason: 'requested_by_customer',
            });
            yield booking_models_1.Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: booking_interface_1.PaymentStatus.REFUNDED,
                bookingStatus: booking_interface_1.BookingStatus.CANCELLED,
            });
        }
        catch (error) {
            console.error('Refund failed:', error);
            // Don't throw error as booking is already cancelled
        }
    }
    return updatedBooking;
});
// Complete booking (for coaches)
const completeBooking = (bookingId, coachId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_models_1.Booking.findOne({
        _id: bookingId,
        coachId: new mongoose_1.Types.ObjectId(coachId),
        bookingStatus: booking_interface_1.BookingStatus.CONFIRMED,
    });
    if (!booking) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Booking not found or not confirmed');
    }
    // Check if the booking time has passed
    const bookingDateTime = new Date(booking.selectedDay);
    const [hours, minutes] = booking.startTime.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
    // const now = new Date();
    // if (now < bookingDateTime) {
    //   throw new AppError(
    //     httpStatus.BAD_REQUEST,
    //     'Cannot complete future booking',
    //   );
    // }
    const updatedBooking = yield booking_models_1.Booking.findByIdAndUpdate(bookingId, { sessionStatus: booking_interface_1.SessionStatus.COMPLETED }, { new: true });
    const client = yield user_models_1.User.findById(booking === null || booking === void 0 ? void 0 : booking.userId);
    yield (0, sendNotification_1.sendNotifications)({
        receiver: booking === null || booking === void 0 ? void 0 : booking.userId,
        type: 'ORDER',
        message: `Client ${client === null || client === void 0 ? void 0 : client.fullName} has completed the session`,
    });
    // Update user experience
    yield user_models_1.User.findByIdAndUpdate(coachId, {
        $inc: { totalSessionComplete: 1 },
    });
    return updatedBooking;
});
// Clean up expired pending bookings (run as cron job)
const cleanupExpiredBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    const expiredTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    const expiredBookings = yield booking_models_1.Booking.find({
        bookingStatus: booking_interface_1.BookingStatus.PENDING,
        paymentStatus: booking_interface_1.PaymentStatus.PENDING,
        createdAt: { $lt: expiredTime },
    });
    for (const booking of expiredBookings) {
        yield booking_models_1.Booking.findByIdAndDelete(booking._id);
        console.log(`Cleaned up expired booking: ${booking._id}`);
    }
});
const getAllBooking = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.default(booking_models_1.Booking.find({})
        .populate({
        path: 'userId',
        select: 'fullName email image',
    })
        .populate({
        path: 'sessionId',
        select: 'pricePerSession aboutMe',
    })
        .populate({
        path: 'coachId',
        select: 'fullName email image',
    }), query);
    const result = yield queryBuilder
        .fields()
        .filter()
        .paginate()
        .priceRange()
        .sort()
        .search(['orderNumber'])
        .modelQuery.exec();
    const meta = yield queryBuilder.countTotal();
    return {
        meta,
        result,
    };
});
const getSingleBooking = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield booking_models_1.Booking.findById(bookingId)
        .populate({
        path: 'userId',
        select: 'fullName email image',
    })
        .populate({
        path: 'sessionId',
        select: 'pricePerSession aboutMe',
    })
        .populate({
        path: 'coachId',
        select: 'fullName email image',
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Booking not found');
    }
    return result;
});
const getDateRange = (filter) => {
    const today = new Date();
    let startDate;
    switch (filter) {
        case 'today':
            startDate = new Date(today.setHours(0, 0, 0, 0)); // Set to midnight today
            break;
        case 'thisWeek':
            const firstDayOfWeek = today.getDate() - today.getDay(); // Get the first day of the week (Sunday)
            startDate = new Date(today.setDate(firstDayOfWeek));
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1); // First day of this month
            break;
        case 'last30Days':
            startDate = new Date(today.setDate(today.getDate() - 30)); // 30 days ago
            break;
        default:
            startDate = today; // Default to today
            break;
    }
    return startDate;
};
const getBookingAnalysis = (dateFilter) => __awaiter(void 0, void 0, void 0, function* () {
    // Calculate the start date based on the filter
    const startDate = getDateRange(dateFilter);
    // Extend the query to filter by date
    const dateQuery = { createdAt: { $gte: startDate } };
    const result = yield booking_models_1.Booking.aggregate([
        {
            $match: Object.assign({}, dateQuery),
        },
        {
            $group: {
                _id: '$bookingStatus',
                totalBookings: { $sum: 1 },
                totalAmount: { $sum: '$price' },
            },
        },
    ]);
    // Define default statuses
    const defaultStatuses = [
        booking_interface_1.BookingStatus.PENDING,
        booking_interface_1.BookingStatus.CONFIRMED,
        booking_interface_1.BookingStatus.COMPLETED,
        booking_interface_1.BookingStatus.CANCELLED,
    ];
    // Initialize the result with default values for all statuses
    let resultMap = defaultStatuses.map((status) => ({
        _id: status,
        totalBookings: 0,
        totalAmount: 0,
    }));
    // Update the resultMap with actual data from the aggregation
    result.forEach((item) => {
        const statusIndex = resultMap.findIndex((status) => status._id === item._id);
        if (statusIndex !== -1) {
            resultMap[statusIndex] = item; // Replace with the actual result
        }
    });
    return resultMap;
});
exports.bookingService = {
    createPaymentIntent,
    getAllBooking,
    getUserBookings,
    getCoachBookings,
    getBookingById,
    cancelBooking,
    completeBooking,
    cleanupExpiredBookings,
    rescheduleBooking,
    getSingleBooking,
    getBookingAnalysis,
};
// export const bookingService = {
//   bookTimeSlot,
//   createPaymentIntent
// };
