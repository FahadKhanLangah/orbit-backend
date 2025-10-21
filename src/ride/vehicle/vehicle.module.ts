import { Module } from '@nestjs/common';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DriverSchema } from '../driver/entity/driver.entity';
import { VehicleSchema } from './entity/vehicle.entity';
import { FileUploaderModule } from 'src/common/file_uploader/file_uploader.module';
import { AuthModule } from 'src/api/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Driver", schema: DriverSchema },
      { name: "Vehicle", schema: VehicleSchema }
    ]),
    FileUploaderModule,
    AuthModule
  ],
  controllers: [VehicleController],
  providers: [VehicleService]
})
export class VehicleModule { }
