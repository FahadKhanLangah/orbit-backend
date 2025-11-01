import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum JobCategory {
  Technology = 'technology',
  Marketing = 'marketing',
  Finance = 'finance',
  Operations = 'operations',
  HR = 'hr',
  Rider = 'rider',
  CustomerSupport = 'customer_support',
  Sales = 'sales',
  Other = 'other',
}

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  employerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true, text: true })
  title: string;

  @Prop({ required: true, text: true })
  description: string;

  @Prop({ required: true })
  qualifications: string;

  @Prop({ required: true, trim: true })
  salaryRange: string; 

  @Prop({ required: true, enum: JobCategory })
  category: JobCategory;

  @Prop({ required: true })
  location: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const JobSchema = SchemaFactory.createForClass(Job);

// Create a text index for the search bar
JobSchema.index({ title: 'text', description: 'text' });