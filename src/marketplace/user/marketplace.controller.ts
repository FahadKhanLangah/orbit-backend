import { Body, Get, Post, Req, UseGuards } from '@nestjs/common';
import { V1Controller } from 'src/core/common/v1-controller.decorator';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { MarketPlaceService } from './marketplace.service';
import { CreateMarketUserDto } from './dto/create-marketUser.dto';

@UseGuards(VerifiedAuthGuard)
@V1Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketPlaceUserServices: MarketPlaceService
  ) { }

  @Post("user/create")
  async createUserMarketProfile(
    @Req() req: any,
    @Body() dto: CreateMarketUserDto
  ) {
    const userId = req.user_id;
    dto.userId = userId;
    await this.marketPlaceUserServices.createProfile(dto)
  }

  @Get("user/profile")
  async getUserMarketProfile(
    @Req() req: any
  ) {
    return this.marketPlaceUserServices.getMarkerUserProfile(req.user._id)
  }
}
