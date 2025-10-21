import { Module } from "@nestjs/common";
import { DriverModule } from "./driver/driver.module";
import { RidesModule } from './rides/rides.module';
import { VehicleModule } from './vehicle/vehicle.module';


@Module({
  imports: [
    DriverModule,
    RidesModule,
    VehicleModule
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class RideModule { }