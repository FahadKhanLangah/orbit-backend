import { Schema } from "mongoose";

export enum SupportTicketCategory {
  Account = 'account',
  Membership = 'membership',
  Accessibility = 'accessibility',
  Guides = 'guides',
  Maps = 'maps',
  Other = 'other'
}

export enum SupportTicketStatus {
  Open = 'open',
  InProgress = 'in_progress',
  Resolved = 'resolved'
}

export interface ISupportTicket {
  _id: string;
  userId: string;
  category: SupportTicketCategory;
  message: string;
  status: SupportTicketStatus;
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}


export const SupportTicketSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: SupportTicketCategory,
    required: true
  },
  message: String,
  status: { type: String, enum: SupportTicketStatus, default: SupportTicketStatus.Open },
  adminResponse: String,
}, { timestamps: true });
