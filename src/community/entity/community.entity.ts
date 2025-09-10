import { Document, Schema } from 'mongoose';

export interface ICommunity extends Document {
  _id: string;
  cId: string;
  name: string;
  desc?: string;
  cImg?: string;
  groups: string[];
  members: {
    userId: string;
    role: 'ADMIN' | 'MEMBER';
    status: 'ACTIVE' | 'PENDING' | 'REMOVED';
  }[];
  // ADDED: Maximum number of members allowed. null means infinite.
  maxMembers?: number;
  // ADDED: If true, new members need admin approval.
  joinApprovalRequired: boolean;
  extraData?: {};
  createdAt: Date;
  updatedAt: Date;
}

export const CommunitySchema: Schema = new Schema(
  {
    cId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    desc: { type: String, default: null },
    cImg: { type: String, default: null },
    groups: [{ type: Schema.Types.ObjectId, ref: 'GroupSettings', default: [] }],
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' },
        status: {
          type: String,
          enum: ['ACTIVE', 'PENDING', 'REMOVED'],
          default: 'PENDING',
        },
      },
    ],
    // ADDED: Schema definition for maxMembers.
    maxMembers: { type: Number, default: null },
    // ADDED: Schema definition for joinApprovalRequired.
    joinApprovalRequired: { type: Boolean, default: true },
    extraData: { type: Object, default: null },
    createdAt: { type: Date, select: true },
    updatedAt: { type: Date, select: false },
  },
  {
    timestamps: true,
  },
);