import mongoose from "mongoose";
import { User } from "./userTypes";

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      require: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      require: [true, "Email is required"],
      trim: true,
    },
    password: {
      type: String,
      require: [true, "Password is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<User>("Webuser", userSchema);
