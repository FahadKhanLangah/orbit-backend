// video.schema.ts
import { Schema, Types } from "mongoose";

export interface IVideo {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

export const VideoSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true }, // path returned by uploader
    thumbnailUrl: { type: String, default: null }, // optional
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);
