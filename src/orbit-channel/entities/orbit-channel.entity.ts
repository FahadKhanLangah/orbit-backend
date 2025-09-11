// src/orbit-channel/entities/orbit-channel.entity.ts
import mongoose, { Document, Schema } from 'mongoose';
import pM from 'mongoose-paginate-v2';

export interface IOrbitChannel extends Document {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  image?: string; // The URL to the channel's image
  topic?: string; // A topic or category for the channel
  isPublic: boolean; // Is the channel visible in public searches?
  createdAt: Date;
  updatedAt: Date;
}

export const OrbitChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, default: null },
    topic: { type: String, default: null },
    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

OrbitChannelSchema.plugin(pM);