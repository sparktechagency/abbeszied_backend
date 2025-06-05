import { Types } from 'mongoose';

export interface ITimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface ISession {
  pricePerSession: number;
  selectedDay: Date;
  timeSlots: ITimeSlot[];
  coachId: Types.ObjectId;
  isActive: boolean;
}

export type TSessionResponse = {
  _id: Types.ObjectId;
} & ISession;