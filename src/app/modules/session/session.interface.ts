import { Types } from 'mongoose';

export interface ITimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: Types.ObjectId;
  bookingDate?: Date;
}

export interface ISession {
  pricePerSession: number;
  selectedDay: Date;
  timeSlots: ITimeSlot[];
  userId: Types.ObjectId;
  isActive: boolean;
}

export type TSessionResponse = {
  _id: Types.ObjectId;
} & ISession;

export interface ISessionStatus {
  upcoming: Array<{
    sessionId: Types.ObjectId;
    coachId: Types.ObjectId;
    startTime: string;
    endTime: string;
    selectedDay: Date;
    pricePerSession: number;
  }>;
  completed: Array<{
    sessionId: Types.ObjectId;
    coachId: Types.ObjectId;
    startTime: string;
    endTime: string;
    selectedDay: Date;
    pricePerSession: number;
    completedAt: Date;
  }>;
}