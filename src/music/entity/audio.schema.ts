// audio.schema.ts
import { Schema, Types } from "mongoose";

export interface IAudio{
  userId: Types.ObjectId;
  title: string;
  description?: string;
  fileUrl: string;
  duration?: number;
  createdAt?: Date;
}

export const AudioSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true }, // path returned by uploader
    duration: { type: Number, default: 0 }, // optional
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
