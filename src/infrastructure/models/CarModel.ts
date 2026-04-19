import mongoose, { Schema } from "mongoose";

export interface ICar {
  name: string;
  model: string;
  type: string;
  pricePerDay: number;
  seats: number;
  available: boolean;
}

const carSchema = new Schema<ICar>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const CarModel = mongoose.model<ICar>("Car", carSchema);
