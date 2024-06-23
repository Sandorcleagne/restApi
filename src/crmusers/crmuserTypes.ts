import { Document } from "mongoose";

export interface CRMUser extends Document {
  _id: string;
  userName: string;
  password: string;
  email: string;
  active: boolean;
  refreshtoken: string;
  role: string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccesstoken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
}
