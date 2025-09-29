import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AdStatus {
  PENDING = 'PENDING',   // Pending approval or payment
  ACTIVE = 'ACTIVE',     // Currently being displayed to users
  EXPIRED = 'EXPIRED',   // The runtime has finished
  REJECTED = 'REJECTED', // Rejected by an admin
}

@Schema({ timestamps: true })
export class Ad extends Document {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  imageUrl: string;
  @Prop({ required: true })
  linkUrl: string;
  @Prop({
    type: String,
    enum: Object.values(AdStatus),
    default: AdStatus.PENDING,
    index: true
  })
  status: AdStatus;
  @Prop({ required: true })
  startTime: Date;
  @Prop({ required: true, index: true })
  endTime: Date;
}

export const AdSchema = SchemaFactory.createForClass(Ad);