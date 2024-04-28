import mongoose from "mongoose";
import { User } from "./userTypes";
import bcrypt from "bcrypt";
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
userSchema.pre("save", async function (this: User, next) {
  if (!this.isModified("password")) {
    return next();
  } else {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
});
export default mongoose.model<User>("Webuser", userSchema);
