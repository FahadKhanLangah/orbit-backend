import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ServiceBookingSchema } from "./entity/service-booking.entity";
import { ServiceBookingController } from "./service-booking.controller";
import { ServiceBookingService } from "./service-booking.service";


@Module({
  imports: [
    MongooseModule.forFeature([{
      name: "ServiceBooking", schema: ServiceBookingSchema
    }])
  ],
  exports: [ServiceBookingService],
  providers: [ServiceBookingService],
  controllers: [ServiceBookingController]
})

export class ServiceBookingModule { }