import { Types } from 'mongoose';

export type IChat = {
     participants: Types.ObjectId[];
     lastMessage: Types.ObjectId;
     read: boolean;
     deletedBy: [Types.ObjectId];
     isDeleted: boolean;
     status: 'active' | 'deleted';
     readBy: Types.ObjectId[];
};
