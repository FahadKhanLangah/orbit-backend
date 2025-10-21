import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateVehicleChargesDto } from './dto/update-vehicle-charges.dto';


@Controller('vehicle')
@UseGuards(VerifiedAuthGuard)
export class VehicleController {
  constructor(
    private readonly vehicleService: VehicleService
  ) { }

  @Post('create')
  @UseInterceptors(
    FileInterceptor('vehicleImage')
  )
  async createVehicle(
    @Req() req: any,
    @Body() createVehicleDto: CreateVehicleDto,
    @UploadedFile() vehicleImage?: Express.Multer.File
  ) {

    const user = req.user;
    return await this.vehicleService.createVehicle(user, createVehicleDto, vehicleImage);
  }

  @Get('available')
  async getAvailableVehicles() {
    return await this.vehicleService.getAvailableVehicles({})
  }

  // get my vehicles
  @Get('my-vehicles')
  async getMyVehicles(@Req() req: any) {
    const user = req.user;
    return await this.vehicleService.getMyVehicles(user._id);
  }

  @Patch(':id/charges')
  async updateMyVehicleCharges(
    @Req() req: any,
    @Param('id') vehicleId: string,
    @Body() updateChargesDto: UpdateVehicleChargesDto,
  ) {
    const user = req.user;
    return this.vehicleService.updateMyVehicleCharges(user, vehicleId, updateChargesDto);
  }
}
