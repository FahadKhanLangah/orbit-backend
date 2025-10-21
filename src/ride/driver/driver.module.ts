import { Module } from "@nestjs/common";
import { DriverService } from "./driver.service";
import { DriverController } from "./driver.controller";
import { FileUploaderModule } from "src/common/file_uploader/file_uploader.module";
import { MongooseModule } from "@nestjs/mongoose";
import { DriverSchema } from "./entity/driver.entity";
import { AuthModule } from "src/api/auth/auth.module";


@Module({
  imports: [
    FileUploaderModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: "Driver", schema: DriverSchema }
    ])
  ],
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService],
})

export class DriverModule { }