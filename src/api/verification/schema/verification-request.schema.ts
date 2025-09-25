import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class VerificationRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId | IUser;

  @Prop({ required: true })
  idDocumentUrl: string;

  @Prop({ required: true })
  selfieUrl: string;

  @Prop({
    type: String,
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Prop()
  rejectionReason: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy: string;
}

export const VerificationRequestSchema = SchemaFactory.createForClass(VerificationRequest);