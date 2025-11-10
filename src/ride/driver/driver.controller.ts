import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { DriverService } from "./driver.service";
import { VerifiedAuthGuard } from "src/core/guards/verified.auth.guard";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { UpdateLocationDto } from "./dto/update-location.dto";

@UseGuards(VerifiedAuthGuard)
@Controller('ride')
export class DriverController {
  constructor(private readonly driverService: DriverService) { }

  @Get('profile/me')
  async getMyDriverProfile(
    @Req() req: any
  ) {
    const userId = req.user._id;
    return await this.driverService.getDriverByUserId(userId);
  }

  @Post('profile/create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'nationalId', maxCount: 1 },
      { name: 'passport', maxCount: 1 },
      { name: 'driversLicense', maxCount: 1 },
      { name: 'logbook', maxCount: 1 },
      { name: 'psvInsurance', maxCount: 1 },
      { name: 'vehicleInspection', maxCount: 1 },
      { name: 'kraPin', maxCount: 1 },
      { name: 'driverPhoto', maxCount: 1 },
    ]),
  )
  async createDriverProfile(
    @Req() req: any,
    @Body() body: any,
    @UploadedFiles()
    files: {
      nationalId?: Express.Multer.File[];
      passport?: Express.Multer.File[];
      driversLicense?: Express.Multer.File[];
      logbook?: Express.Multer.File[];
      psvInsurance?: Express.Multer.File[];
      vehicleInspection?: Express.Multer.File[];
      kraPin?: Express.Multer.File[];
      driverPhoto?: Express.Multer.File[];
    },
  ) {
    const user = req.user;
    return this.driverService.createDriverProfile(user, files);
  }
  // get driver profile
  @Get('drivers')
  async getDriverProfile(
    @Req() req: any
  ) {
    const userId = req.user._id;
    return await this.driverService.getDriverByUserId(userId);
  }
  // get driver profile by his id
  @Get('driver/:id')
  async getDriverById(
    @Param('id') driverId: string
  ) {
    console.log(driverId);
    return await this.driverService.getDriverById(driverId);
  }

  @Patch('location')
  updateLocation(@Req() req: any, @Body() updateLocationDto: UpdateLocationDto) {
    const user = req.user;
    return this.driverService.updateLocation(user, updateLocationDto);
  }
}