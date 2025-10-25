import { Body, Controller, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { RidesService } from './rides.service';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';
import { CreateRideDto } from './dto/create-ride.dto';
import { GetFareEstimateDto } from './dto/get-fare-estimate.dto';
import { AcceptRideDto } from './dto/accept-ride.dto';

@UseGuards(VerifiedAuthGuard)
@Controller('rides')
export class RidesController {
  constructor(
    private readonly rideService: RidesService
  ) { }

  @Post('request')
  async requestRide(
    @Req() req: any,
    @Body() createRideDto: CreateRideDto
  ) {
    const user = req.user;
    return await this.rideService.requestRide(user, createRideDto)
  }

  @Post('fare-estimate')
  async getFareEstimate(@Body() getFareEstimateDto: GetFareEstimateDto) {
    return this.rideService.getFareEstimate(getFareEstimateDto);
  }

  @Patch(':id/start')
  async startRide(
    @Req() req: any,
    @Param('id') rideId: string,
  ) {
    const driverUser = req.user;
    return this.rideService.startRide(driverUser, rideId);
  }

  @Patch(':id/complete')
  async completeRide(
    @Req() req: any,
    @Param('id') rideId: string,
  ) {
    const driverUser = req.user;
    return this.rideService.completeRide(driverUser, rideId);
  }
}
