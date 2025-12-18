import mongoose from "mongoose";

export enum ReportStatus {
  PENDING = "pending",
  RESOLVED = "resolved",
  DISMISSED = "dismissed"
}

export interface IReport extends mongoose.Document {
  reporter: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: ReportStatus;
}

export const ReportSchema = new mongoose.Schema<IReport>({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  reason: { type: String, required: true },
  description: String,
  status: { type: String, enum: ReportStatus, default: ReportStatus.PENDING }
}, { timestamps: true });