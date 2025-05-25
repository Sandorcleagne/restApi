import mongoose from "mongoose";
import { ShortUrl } from "./shortnerTypes";

const shortUrlSchema = new mongoose.Schema<ShortUrl>(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortUrlId: {
      type: String,
      required: true,
      unique: true,
    },
    shortUrl: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    userId: {
      type: String,
      required: false, // Optional field for user association
    },
    customAlias: {
      type: String,
      required: false, // Optional field for custom alias
    },
    expirationDate: {
      type: Date,
      required: false, // Optional field for URL expiration
    },
    tags: {
      type: [String],
      required: false, // Optional field for tags or categories
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ShortUrl>("ShortUrl", shortUrlSchema);
