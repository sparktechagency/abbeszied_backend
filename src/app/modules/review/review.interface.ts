import { Types } from 'mongoose';

export type IReview = {
     coachId: Types.ObjectId;
     clientId: Types.ObjectId;
     comment: string;
     rating: number;
};
