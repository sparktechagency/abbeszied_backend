import { Types } from 'mongoose';


export interface ITimeSlot {
  startTime: string; // 24-hour format
  startTime12h?: string; // 12-hour format with AM/PM
  endTime: string; // 24-hour format
  endTime12h?: string; // 12-hour format with AM/PM
  isBooked: boolean;
  clientId?: Types.ObjectId;
}

export interface IDailySession {
  selectedDay: Date;
  timeSlots: ITimeSlot[];
  isActive: boolean;
}

export interface ISession {
  _id?: Types.ObjectId;
  pricePerSession: number;
  dailySessions: IDailySession[];
  language: string[];
  coachId: Types.ObjectId;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}