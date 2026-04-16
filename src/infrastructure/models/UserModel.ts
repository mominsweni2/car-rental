import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model<IUserDocument>("User", userSchema);
