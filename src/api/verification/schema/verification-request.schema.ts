import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class VerificationRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: string;

  @Prop({ required: true })
  idDocumentUrl: string; // URL to the stored ID/Passport file

  @Prop({ required: true })
  selfieUrl: string; // URL to the stored selfie

  @Prop({
    type: String,
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Prop()
  rejectionReason: string; // For admin feedback

  @Prop({ type: Types.ObjectId, ref: 'User' }) // Assuming admins are also users
  reviewedBy: string;
}

export const VerificationRequestSchema = SchemaFactory.createForClass(VerificationRequest);