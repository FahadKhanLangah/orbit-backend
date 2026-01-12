import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class JobShare extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId; // Who is forwarding it

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId; // Who is receiving it

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId; // The job being forwarded

  @Prop({ type: String, default: '' })
  note: string; // Optional message (e.g., "Check this out")
}

export const JobShareSchema = SchemaFactory.createForClass(JobShare);