import { Document, Types } from 'mongoose';

interface ILocationLatLong {
  type: 'Point';
  coordinates: [number, number]; // [ longitude, latitude ]
}

// Define the IField interface extending Document
export interface IParking extends Document {
  ownerId: Types.ObjectId;
  name: string;
  spotType: string;
  vihicleType: 'Car' | 'Truck' | 'Car & Truck';
  slot: number;
  location: string;
  locationLatLong: ILocationLatLong;
  daylyPrice: number;
  weeklyPrice: number;
  images: string[];
  openTime: string;
  closeTime: string;
  availableDays: (
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday'
  )[];
  rules: Types.ObjectId[];
  description: string;
  revenue?: number;
  isActive: boolean;
  isDeleted: boolean;
}
