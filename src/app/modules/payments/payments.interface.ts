import { Types } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface IPayment {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  coachId: Types.ObjectId;
  amount: number;
  currency?: string;
  paymentIntentId: string;
  status: PaymentStatus;
  paymentMethod?: string;
  receiptUrl?: string;
  refunded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
