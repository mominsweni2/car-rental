import mongoose, { Schema, Document } from "mongoose";

export interface ICarDocument extends Document {
  name: string;
  model: string;
  type: string;
  pricePerDay: number;
  seats: number;
  available: boolean;
}

const carSchema = new Schema<ICarDocument>(
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

export const CarModel = mongoose.model<ICarDocument>("Car", carSchema);
