import mongoose from "mongoose";
import { CRMUser } from "./crmuserTypes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

const CrmUserSchema = new mongoose.Schema<CRMUser>(
  {
    userName: {
      type: String,
      require: [true, "Username is required"],
      trim: true,
    },
    password: {
      type: String,
      require: [true, "Password is required"],
      trim: true,
    },
    email: {
      type: String,
      require: [true, "Email is required"],
    },
    role: {
      type: String,
      require: [true, "Role is required"],
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
CrmUserSchema.pre("save", async function (this: CRMUser, next) {
  if (!this.isModified("password")) {
    return next();
  } else {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
});
CrmUserSchema.methods.isPasswordCorrect = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("An error occurred:", error);
  }
};
CrmUserSchema.methods.generateAccesstoken = async function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    config.ACCESS_TOKEN_SECRETE,
    { expiresIn: config.ACCESS_TOKEN_EXPIRY }
  );
};
CrmUserSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ _id: this._id }, config?.REFRESH_TOKEN_SECRETE, {
    expiresIn: config?.REFRESH_TOKEN_EXPIRY,
  });
};
export default mongoose.model<CRMUser>("CRMUser", CrmUserSchema);
