import { Body, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { V1Controller } from 'src/core/common/v1-controller.decorator';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { MarketPlaceService } from './marketplace.service';
import { CreateMarketUserDto } from './dto/create-marketUser.dto';
import { SaveSearchDto } from './dto/save-search.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploaderService } from 'src/common/file_uploader/file_uploader.service';

@UseGuards(VerifiedAuthGuard)
@V1Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketPlaceUserServices: MarketPlaceService,
    private readonly fileUploader: FileUploaderService
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

  @Get('saved/listing')
  getSaved(@Req() req) {
    return this.marketPlaceUserServices.getSavedListing(req.user._id);
  }

  @Post(':id/save')
  saveListing(@Req() req, @Param('id') listingId) {
    return this.marketPlaceUserServices.addUserListing(req.user._id, listingId);
  }

  @Delete(':id/save')
  unSaveListing(@Req() req, @Param('id') listingId) {
    return this.marketPlaceUserServices.removeSavedListing(req.user._id, listingId);
  }

  @Post('saved-searches')
  async saveSearch(@Req() req, @Body() dto: SaveSearchDto) {
    return this.marketPlaceUserServices.createSavedSearch(req.user._id, dto);
  }

  @Get('saved-searches')
  async getMySavedSearches(@Req() req) {
    return this.marketPlaceUserServices.getUserSavedSearches(req.user._id);
  }

  @Delete('saved-searches/:id')
  async removeSavedSearch(@Req() req, @Param('id') id: string) {
    return this.marketPlaceUserServices.deleteSavedSearch(req.user._id, id);
  }

  @Patch('blocked-users/:id')
  async blockUser(@Req() req, @Param('id') userId: string) {
    return this.marketPlaceUserServices.blockUser(req.user._id, userId);
  }

  @Post('breeder-verification')
  @UseInterceptors(FileInterceptor('licenseDoc'))
  async applyForBreeder(
    @Req() req,
    @Body('licenseNumber') licenseNumber: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const key = await this.fileUploader.uploadMediaFile(file, 'licenses', req.user._id);
    return this.marketPlaceUserServices.submitBreederLicense(req.user._id, licenseNumber, key);
  }

}
