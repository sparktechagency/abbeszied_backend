import { Schema, model } from 'mongoose';
import { TNotification } from './notification.interface';

// Define the schema
const NotificationSchema = new Schema<TNotification>(
  {
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    recipientRole: {
      type: String,
      enum: ['ADMIN', 'SUPER_ADMIN', 'USER'],
      default: 'ADMIN',
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Create and export the model
const Notification = model<TNotification>('Notification', NotificationSchema);

export default Notification;
