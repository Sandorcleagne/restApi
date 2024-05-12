import mongoose from "mongoose";
import { User } from "./userTypes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
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
    active: {
      type: Boolean,
      default: true,
    },
    refreshtoken: {
      type: String,
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
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccesstoken = async function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    config.ACCESS_TOKEN_SECRETE,
    { expiresIn: config.ACCESS_TOKEN_EXPIRY }
  );
};
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ _id: this._id }, config?.REFRESH_TOKEN_SECRETE, {
    expiresIn: config?.REFRESH_TOKEN_EXPIRY,
  });
};
export default mongoose.model<User>("Webuser", userSchema);
