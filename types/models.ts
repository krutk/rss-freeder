import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

export interface Feed {
  _id: ObjectId;
  url: string;
  userId: string;
}

export interface HistoryItem {
  _id: ObjectId;
  userId: string;
  title: string;
  link: string;
  contentSnippet: string;
  openedAt: string;
  service: "archive" | "smry";
}
