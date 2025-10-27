import { forwardRef, Module } from '@nestjs/common';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RideSchema } from './entity/ride.entity';
import { AuthModule } from 'src/api/auth/auth.module';
import { DriverSchema } from '../driver/entity/driver.entity';
import { VehicleSchema } from '../vehicle/entity/vehicle.entity';
import { GoogleMapsModule } from 'src/google-maps/google-maps.module';
import { SocketIoModule } from 'src/chat/socket_io/socket_io.module';
import { UserSchema } from 'src/api/user_modules/user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Ride", schema: RideSchema },
      { name: "Driver", schema: DriverSchema },
      { name: "Vehicle", schema: VehicleSchema },
      { name: "User", schema: UserSchema }
    ]),
    AuthModule,
    GoogleMapsModule,
    forwardRef(() => SocketIoModule),
  ],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService],
})
export class RidesModule { }
