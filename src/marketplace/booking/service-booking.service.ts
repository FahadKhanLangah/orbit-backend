import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IServiceBooking, BookingStatus } from './entity/service-booking.entity';

@Injectable()
export class ServiceBookingService {
  constructor(
    @InjectModel('ServiceBooking') private bookingModel: Model<IServiceBooking>,
    // private chatService: ChatService // 
  ) {}

  async createBooking(clientId: string, dto: { serviceId: string, providerId: string, date: Date, description: string }) {
    
    if (new Date(dto.date) < new Date()) {
      throw new BadRequestException("Cannot book a service in the past");
    }

    const booking = await this.bookingModel.create({
      client: clientId,
      provider: dto.providerId,
      serviceListing: dto.serviceId,
      bookingDate: dto.date,
      description: dto.description
    });
    return booking;
  }


  async updateStatus(userId: string, bookingId: string, status: BookingStatus) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.provider.toString() !== userId) {
      throw new BadRequestException('Only the service provider can manage this request');
    }

    booking.status = status;
    await booking.save();
    return booking;
  }

  async getMyBookings(userId: string) {
    return this.bookingModel.find({
      $or: [{ client: userId }, { provider: userId }]
    })
    .populate('serviceListing', 'title price')
    .populate('client', 'firstName avatar')
    .sort({ bookingDate: 1 });
  }
}