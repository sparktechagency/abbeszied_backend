import { Document, Types } from 'mongoose';

// Define the IField interface extending Document
export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  parkingId: Types.ObjectId;
  userId: Types.ObjectId;
  businessOwnerId: Types.ObjectId;
  customerId: Types.ObjectId;
  adminCommission: string;
  adminRevenue: number;
  paymentIntent: string;
  totalPrice: number;
}
