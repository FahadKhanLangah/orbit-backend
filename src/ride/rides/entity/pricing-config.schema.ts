import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PricingConfigDocument = PricingConfig & Document;

@Schema({ timestamps: true })
export class PricingConfig extends Document {
  @Prop({ required: true, default: 30 })
  baseFare: number;

  @Prop({
    type: Object,
    default: {
      Economy: 30,
      OrbitComfort: 45,
      OrbitXL: 60,
      OrbitGreen: 40,
    },
  })
  perKmRate: Record<string, number>;

  @Prop({ required: true, default: 0.15 })
  systemCommissionRate: number;

  @Prop({ required: true, default: 5 })
  perMinuteRate: number;

  @Prop({
    type: Object,
    default: {
      night: { startHour: 22, endHour: 6, rate: 1.4 },
      weather: { bad: 1.3, normal: 1.0 },
      roadCondition: { poor: 1.15, good: 1.0 },
    },
  })
  multipliers: {
    night: { startHour: number; endHour: number; rate: number };
    weather: Record<string, number>;
    roadCondition: Record<string, number>;
  };

  @Prop({
    type: Object,
    default: {
      fuelType: { Electric: -10, Fuel: 0 },
    },
  })
  adjustments: {
    fuelType: Record<string, number>;
  };
}

export const PricingConfigSchema = SchemaFactory.createForClass(PricingConfig);