import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class LoyaltySetting extends Document {
  @Prop({ default: 10 })
  pointsPerRide: number;

  @Prop({ default: 100 })
  pointsToCurrencyRate: number;

  @Prop({ default: true })
  isActive: boolean;
}


export const LoyaltySettingSchema = SchemaFactory.createForClass(LoyaltySetting);