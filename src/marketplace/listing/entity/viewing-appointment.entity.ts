import mongoose, { Document, Schema } from 'mongoose';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface IViewingAppointment extends Document {
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  appointmentTime: Date;
  status: AppointmentStatus;
  note?: string;
}

export const ViewingAppointmentSchema = new Schema<IViewingAppointment>({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  
  appointmentTime: { type: Date, required: true },
  
  status: { 
    type: String, 
    enum: Object.values(AppointmentStatus), 
    default: AppointmentStatus.PENDING 
  },
  
  note: { type: String }
}, { timestamps: true });

export const ViewingAppointment = mongoose.model<IViewingAppointment>(
  'ViewingAppointment', 
  ViewingAppointmentSchema
);