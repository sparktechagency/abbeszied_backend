import { Schema, model } from 'mongoose';
import { TFavourite } from './favourite.interface';

// Define the schema
const favouriteSchema = new Schema<TFavourite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    parkingId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Parking',
    },
  },
  {
    timestamps: true,
  },
);

// Create and export the model
const Favourite = model<TFavourite>('Favourite', favouriteSchema);

export default Favourite;
