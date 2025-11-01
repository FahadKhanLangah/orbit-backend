import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type JobSeekerProfileDocument = JobSeekerProfile & Document;

@Schema({ timestamps: true })
export class JobSeekerProfile {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  headline: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: Number, required: true, min: 0 })
  yearsOfExperience: number;

  @Prop({ type: String })
  cvUrl: string;
}

export const JobSeekerProfileSchema = SchemaFactory.createForClass(JobSeekerProfile);
