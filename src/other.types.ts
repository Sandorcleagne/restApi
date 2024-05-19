import { Request } from "express";

export interface CustomRequest extends Request {
  user?: any; // Define the type of the 'user' property if needed
}
