export interface ShortUrl {
  _id: string;
  originalUrl: string;
  shortUrlId: string;
  shortUrl: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  clicks: number;
  userId?: string; // Optional field for user association
  customAlias?: string; // Optional field for custom alias
  expirationDate?: Date; // Optional field for URL expiration
  tags?: string[]; // Optional field for tags or categories
}

export type ExcelRow = {
  url: string;
};
