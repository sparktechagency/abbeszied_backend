// Define the IParkingBooking interface extending Document
import { Document, Types } from 'mongoose';

export interface IParkingBooking extends Document {
  bookingId: string;
  userId: Types.ObjectId;
  parkingId: Types.ObjectId;
  bookingType: 'day' | 'week';
  bookingStartDate: Date;
  bookingEndtDate: Date;
  checkInTime: string;
  perdayPrice?: number;
  totalDays?: number;
  perWeekPrice?: number;
  totalWeeks?: number;
  totalPrice: number;
  vihicleType: 'Car' | 'Truck' | 'Car & Truck';
  vihicleModel: string;
  vihicleLicensePlate: string;
  paymentStatus: 'pending' | 'paid' | 'cancle';
}
