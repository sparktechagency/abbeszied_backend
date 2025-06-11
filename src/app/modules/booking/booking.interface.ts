import { Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface IBooking {
  _id?: Types.ObjectId;
  sessionId: Types.ObjectId;
  coachId: Types.ObjectId;
  userId: Types.ObjectId;
  selectedDay: Date;
  startTime: string;
  endTime: string;
  price: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  cancellationReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateBookingPayload {
  coachId: string;
  sessionId: string;
  selectedDay: string;
  startTime: string;
  endTime: string;
  price: number;
}