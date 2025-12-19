import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { V1Controller } from 'src/core/common/v1-controller.decorator';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { ListingServices } from './listing.service';

@UseGuards(VerifiedAuthGuard)
@V1Controller('analytics')
export class ListingAnalyticsController {
  constructor(private readonly analyticsService: ListingServices) { }

  @Post(':id/view')
  async recordView(@Req() req, @Param('id') listingId: string) {
    return this.analyticsService.recordView(req.user._id, listingId);
  }

  @Post(':id/like')
  async toggleLike(@Req() req, @Param('id') listingId: string) {
    return this.analyticsService.toggleLike(req.user._id, listingId);
  }

  @Post(':id/inquiry')
  async recordInquiry(@Req() req, @Param('id') listingId: string) {
    return this.analyticsService.recordInquiry(req.user._id, listingId);
  }

  @Get(':id')
  async getListingStats(@Param('id') listingId: string) {
    return this.analyticsService.getStatsForListing(listingId);
  }
}