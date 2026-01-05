import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ServiceBookingService } from "./service-booking.service";
import { BookingStatus } from "./entity/service-booking.entity";


@Controller('services/booking')
export class ServiceBookingController {
  constructor(private readonly bookingService: ServiceBookingService) {}

  @Post()
  async book(@Req() req, @Body() dto: any) {
    // dto = { serviceId, providerId, date, description }
    return this.bookingService.createBooking(req.user._id, dto);
  }

  @Patch(':id/status')
  async respond(@Req() req, @Param('id') id: string, @Body('status') status: BookingStatus) {
    return this.bookingService.updateStatus(req.user._id, id, status);
  }

  @Get('my-list')
  async getMyBookings(@Req() req) {
    return this.bookingService.getMyBookings(req.user._id);
  }
}