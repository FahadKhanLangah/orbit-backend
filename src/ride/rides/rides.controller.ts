import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { GetFareEstimateDto } from './dto/get-fare-estimate.dto';
import { Response } from 'express';
import { PassThrough } from 'stream';
import { DownloadRideFormat } from './entity/ride.entity';


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

  // get my rides 
  @Get('my-rides')
  async getMyRides(@Req() req: any) {
    const user = req.user;
    return this.rideService.getRidesByUser(user);
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

  // get loyalty points settings
  @Get('loyalty-points/settings')
  async getLoyaltyPointsSettings() {
    return await this.rideService.getLoyaltySettings();
  }

  @Patch(':id/cancel')
  async cancelRide(
    @Req() req: any,
    @Param('id') rideId: string,
  ) {
    const user = req.user;
    return this.rideService.cancelRide(user, rideId);
  }
  @Get('history/download')
  async downloadRideHistory(
    @Req() req: any,
    @Query('format') format: DownloadRideFormat = DownloadRideFormat.PDF, 
    @Res() res: Response,
  ) {
    const userId = req.user._id; 
    const fileData = await this.rideService.generateRidesHistory(userId, format);

    let filename = `ride-history-${userId}`;

    if (format === DownloadRideFormat.PDF) {
      filename += '.pdf';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      if (fileData instanceof PassThrough || (fileData && typeof (fileData as any).pipe === 'function')) {
        (fileData as any).pipe(res);
      } else {
        res.send(fileData);
      }

    } else { 
      filename += '.csv';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(fileData);
    }
  }
}


