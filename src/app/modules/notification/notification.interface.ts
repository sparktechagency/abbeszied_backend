import { Types } from 'mongoose';

export type TNotification = {
  receiver: Types.ObjectId;
  message: string;
  recipientRole: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  type?: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
};
