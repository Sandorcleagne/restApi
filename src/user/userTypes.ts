import { Document } from "mongoose";
export interface User extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  refreshtoken: string;
  active: boolean;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccesstoken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
}
