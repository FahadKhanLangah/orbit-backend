import { Module } from '@nestjs/common';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RideSchema } from './entity/ride.entity';
import { AuthModule } from 'src/api/auth/auth.module';
import { DriverSchema } from '../driver/entity/driver.entity';
import { VehicleSchema } from '../vehicle/entity/vehicle.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Ride", schema: RideSchema },
      { name: "Driver", schema: DriverSchema },
      { name: "Vehicle", schema: VehicleSchema }
    ]),
    AuthModule
  ],
  controllers: [RidesController],
  providers: [RidesService]
})
export class RidesModule { }
