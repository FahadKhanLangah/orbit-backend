// src/orbit-channel/entities/channel-message.entity.ts
import mongoose, { Document, Schema } from 'mongoose';
import pM from 'mongoose-paginate-v2';

export interface IChannelMessage extends Document {
  _id: string;
  channelId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  createdAt: Date;
}

export const ChannelMessageSchema = new mongoose.Schema(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'OrbitChannel', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true, required: true },
    mediaUrl: { type: String, default: null },
    mediaType: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

ChannelMessageSchema.plugin(pM);