import mongoose, { Schema, Document } from "mongoose";

export interface IBookingDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  guestName?: string;
  guestEmail?: string;
  carId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: "pending" | "approved" | "declined";
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    guestName: {
      type: String,
      required: false,
      trim: true,
    },
    guestEmail: {
      type: String,
      required: false,
      trim: true,
    },
    carId: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export const BookingModel = mongoose.model<IBookingDocument>(
  "Booking",
  bookingSchema,
);
