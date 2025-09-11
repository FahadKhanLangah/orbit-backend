// src/orbit-channel/entities/channel-member.entity.ts
import mongoose, { Document, Schema } from "mongoose";
import pM from "mongoose-paginate-v2";
export enum ChannelRole {
  MEMBER = "member",
  ADMIN = "admin",
}

export interface IChannelMember extends Document {
  _id: string;
  channelId: string;
  userId: string;
  role: ChannelRole;
  createdAt: Date;
}

export const ChannelMemberSchema = new mongoose.Schema(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "OrbitChannel",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: Object.values(ChannelRole),
      default: ChannelRole.MEMBER,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // We only care when they joined
  }
);

ChannelMemberSchema.index({ channelId: 1, userId: 1 }, { unique: true });
ChannelMemberSchema.plugin(pM);
