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
export enum SessionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}
export enum SessionType {
  TRIAL = 'trial',
  SESSION_4 = 'session_4',
  SESSION_8 = 'session_8',
  SESSION_12 = 'session_12',
}
export interface IRescheduleBookingPayload {
  newSelectedDay: string;
  newStartTime: string;
  newEndTime: string;
  reason?: string;
}

export interface IBooking {
  _id?: Types.ObjectId;
  sessionId: Types.ObjectId;
  coachId: Types.ObjectId;
  userId: Types.ObjectId;
  selectedDay: Date;
  orderNumber: string;
  startTime: string;
  endTime: string;
  price: number;
  sessionPackage: SessionType;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  cancellationReason?: string;
  rescheduleReason?: string;
  isRescheduled?: boolean;
  rescheduleCount?: number;
  lastRescheduledAt?: Date;
  sessionStatus: SessionStatus;
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
