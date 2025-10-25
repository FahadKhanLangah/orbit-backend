import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommissionDocument = Commission & Document;

@Schema({ timestamps: true })
export class Commission {
  @Prop({ required: true, default: 10 })
  percentage: number; 

  @Prop({ default: true })
  isActive: boolean;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);
