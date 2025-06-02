function generateAvailableSlots({
  startTime,
  endTime,
  startBreakTime,
  endBreakTime,
  bookings,
  duration,
  minimumSlotTime,
  bookingBreak,
}: any) {
  // console.log({
  //   startTime,
  //   endTime,
  //   startBreakTime,
  //   endBreakTime,
  //   bookings,
  //   duration,
  //   minimumSlotTime,
  //   bookingBreak,
  // });
  // Helper function to convert time string to Date object (for easier comparison)
  function convertToDate(time: any) {
    // console.log({ time });
    const [timeStr, period] = time?.split(' ');
    // console.log({ timeStr });
    // console.log({ period });
    const [hours, minutes] = timeStr?.split(':').map(Number);
    // console.log({ hours });
    // console.log({ minutes });
    // console.log({ hours, minutes });
    const formattedTime = new Date();

    // Handle AM/PM conversion
    if (period === 'AM') {
      // console.log('period AM', period);
      if (hours === 12) {
        formattedTime.setHours(hours + 12);
      } else {
        formattedTime.setHours(hours);
      }
    } else {
      if (hours === 12) {
        formattedTime.setHours(hours);
      } else {
        formattedTime.setHours(hours + 12);
      }
    }
    formattedTime.setMinutes(minutes);
    return formattedTime;
  }

  // Helper function to generate time slots between start and end times
  function generateTimeSlots(start: any, end: any, minSlotDuration: any) {
    // console.log('start', start);
    // console.log('end', end);
    const slots = [];
    let currentTime = convertToDate(start);
    const endTime = convertToDate(end);

    // console.log({ currentTime });
    // console.log({ endTime });

    // Generate slots based on minimum slot time
    while (currentTime < endTime) {
      const nextTime = new Date(currentTime.getTime());
      // console.log({ nextTime });
      nextTime.setMinutes(currentTime.getMinutes() + minSlotDuration);

      // console.log({ nextTime });

      if (nextTime <= endTime) {
        slots.push(
          `${currentTime.getHours() < 13 ? currentTime.getHours() : currentTime.getHours() - 12}:${String(currentTime.getMinutes()).padStart(2, '0')} ${currentTime.getHours() < 12 ? 'AM' : 'PM'}`,
        );
      }

      currentTime = nextTime;
    }
    return slots;
  }

  // Generate all possible slots between startTime and endTime
  const allSlots = generateTimeSlots(startTime, endTime, minimumSlotTime);

  // console.log({ allSlots });

  // Convert break times and bookings to comparable date objects
  const breakStart = convertToDate(startBreakTime);

  // console.log({ breakStart });
  const breakEnd = convertToDate(endBreakTime);

  // console.log({ breakEnd });

  // console.log('booking utils function', bookings);

  const bookedSlots = bookings.map((booking: any) => {
    return {
      start: convertToDate(booking.bookingStartTime),
      end: convertToDate(booking.bookingEndTime),
    };
  });

  // console.log('.........1............');
  // console.log('bookedSlots', bookedSlots);
  // console.log('.........2............');

  // console.log(bookedSlots);
  // console.log('convertToDate endTime');
  // console.log(convertToDate(endTime));

  // Filter out slots that are already booked or fall within break time

  const availableSlots = allSlots.filter((slot, i) => {
    // console.log('.........1............');
    // console.log(slot);
    // console.log('.........2............');
    const slotStart = convertToDate(slot);
    const slotEnd = new Date(slotStart.getTime());
    slotEnd.setMinutes(slotStart.getMinutes() + duration - 1);

    // console.log('.........start............');
    // console.log({ slotStart });
    // console.log({ breakStart });
    // console.log({ slotEnd });
    // console.log(convertToDate(endTime));
    // console.log({ breakEnd });
    // console.log('.........end............');

    // Check if the slot is during the break time
    if (slotStart >= breakStart && slotStart <= breakEnd) {
      // console.log('ttttttttttttttttttttttttttttttttttttttttttttttttttttttttt');
      return false; // Slot is during break time
    }

    const isBooked = bookedSlots.find(
      (booking: any) =>
        (slotStart >= booking.start && slotStart < booking.end) ||
        (slotEnd > booking.start && slotEnd <= booking.end),
    );

    // console.log({ slotStart });
    // console.log({ isBooked });
    // console.log({ slotEnd });

    if (isBooked) {
      return false; // Slot is already booked
    }

    const violatesBreak = bookedSlots.find(
      (booking: any) =>
        slotStart >= booking.end &&
        slotStart < new Date(booking.end.getTime() + bookingBreak * 60000),
    );
    // console.log({ violatesBreak });

    if (violatesBreak) {
      return false;
    }

    if (slotEnd > convertToDate(endTime)) {
      return false;
    }

    return true;
  });

  //   // console.log(availableSlots);

  return availableSlots;
}
function findNextAvailableSlots(
  availableSlots: string[],
  givenTime: string,
): string[] {
  // console.log({ givenTime });
  // Convert given time to minutes (24-hour format)
  const givenTimeMinutes = convertToMinutes(givenTime);
  const nextAvailableSlots: string[] = [];

  // Loop through available time slots and add those >= given time
  for (let slot of availableSlots) {
    const slotMinutes = convertToMinutes(slot);
    if (slotMinutes >= givenTimeMinutes) {
      nextAvailableSlots.push(slot);
    }
  }

  return nextAvailableSlots;
}

function convertToMinutes(time: string): number {
  // Convert time from "hh:mm AM/PM" format to total minutes
  const [timePart, period] = time.split(' ');
  const [hour, minute] = timePart.split(':').map(Number);

  let convertedHour = hour;

  // Convert hour to 24-hour format
  if (period === 'PM' && hour !== 12) {
    convertedHour += 12;
  } else if (period === 'AM' && hour === 12) {
    convertedHour = 0; // Midnight case
  }

  return convertedHour * 60 + minute;
}

function isSameDate(givenDate: string): boolean {
  // Convert current date to "YYYY-MM-DD" format

  // console.log({ givenDate });
  const currentDateFormatted = new Date().toISOString().split('T')[0];
  // console.log({ currentDateFormatted });
  return currentDateFormatted === givenDate;
}

export { generateAvailableSlots, findNextAvailableSlots, isSameDate };
