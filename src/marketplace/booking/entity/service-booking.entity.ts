import mongoose, { Document, Schema } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface IServiceBooking extends Document {
  client: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  serviceListing: mongoose.Types.ObjectId;
  
  bookingDate: Date; // When the work should happen
  description: string; // "Fix leaking sink in kitchen"
  
  status: BookingStatus;
}

export const ServiceBookingSchema = new Schema<IServiceBooking>({
  client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  serviceListing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  
  bookingDate: { type: Date, required: true },
  description: { type: String },
  
  status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING }
}, { timestamps: true });

export const ServiceBooking = mongoose.model<IServiceBooking>('ServiceBooking', ServiceBookingSchema);