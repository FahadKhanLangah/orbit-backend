import { Module } from "@nestjs/common";
import { DriverModule } from "./driver/driver.module";
import { RidesModule } from './rides/rides.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { GoogleMapsModule } from "src/google-maps/google-maps.module";


@Module({
  imports: [
    DriverModule,
    RidesModule,
    VehicleModule,
    GoogleMapsModule
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class RideModule { }