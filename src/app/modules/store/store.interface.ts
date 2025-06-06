import { Schema } from 'mongoose';
export interface IProduct {
     sellerId: Schema.Types.ObjectId;
     buyerId: Schema.Types.ObjectId;
     name: string;
     price: number;
     category: string;
     description: string;
     location: string;
     additionalInfo: string;
     totalViews: number;
     liked: number;
     countAddToCart: number;
     condition: string;
     images: string[];
     status: 'available' | 'sold';
     isDeleted?: boolean;
}
