export interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  coverImage: string;
  file: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}
