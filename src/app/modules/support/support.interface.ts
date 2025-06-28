import { Document } from 'mongoose';

// Define the interface for your settings
export interface ISupport extends Document {
  email: string;
  phone: string;
  location: string;
}
