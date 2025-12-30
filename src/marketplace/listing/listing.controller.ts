// listing.controller.ts
import { Post, UseGuards, UseInterceptors, UploadedFiles, Req, Body, UsePipes, ValidationPipe, Patch, Param, Get, Delete, Query, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostListingDto, SaveListingDraftDto } from './dto/post-listing.dto';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { V1Controller } from 'src/core/common/v1-controller.decorator';
import { ListingServices } from './listing.service';
import { ListingStatus } from './entity/listing.entity';
import { ListingQueryDto } from './dto/listing-query.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@UseGuards(VerifiedAuthGuard)
@V1Controller('listing')
@UsePipes(new ValidationPipe({ transform: true }))
export class ListingController {
  constructor(private readonly listingService: ListingServices) { }


  @Get("search")
  async searchListings(
    @Query() query: ListingQueryDto,
    @Req() req: any
  ) {
    const userId = req.user ? req.user._id : null;
    return this.listingService.searchListings(query, userId);
  }


  @Get('reports')
  async getReports(@Req() req) {
    return this.listingService.getReports();
  }

  @Post('post/new')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
  ]))
  async postList(
    @Req() req: any,
    @Body() dto: PostListingDto,
    @UploadedFiles() files: { images?: Express.Multer.File[], video?: Express.Multer.File[] }
  ) {
    const userId = req.user._id;
    return await this.listingService.postListing(userId, dto, files);
  }

  @Post('post/draft')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
  ]))
  async saveDraft(
    @Req() req,
    @Body() dto: SaveListingDraftDto,
    @UploadedFiles() files: { images?: Express.Multer.File[], video?: Express.Multer.File[] }
  ) {
    return this.listingService.saveDraft(req.user._id, dto, files);
  }

  @Get('drafts')
  async getDrafts(@Req() req) {
    return this.listingService.getDrafts(req.user._id, ListingStatus.DRAFT);
  }

  @Get('all')
  async getListings(
    @Req() req,
    @Query() query: any
  ) {
    return this.listingService.getListings(req.user._id, query);
  }

  @Patch('draft/:id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
  ]))
  async updateDraft(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: SaveListingDraftDto,
    @UploadedFiles() files: { images?: Express.Multer.File[], video?: Express.Multer.File[] }
  ) {
    return this.listingService.updateDraft(id, req.user._id, dto, files);
  }

  @Post('draft/:id/publish')
  async publishDraft(@Param('id') id, @Req() req) {
    const userId = req.user._id;
    return this.listingService.publishDraft(id, userId);
  }

  @Delete('draft/:id/delete')
  async deleteDraft(@Param('id') id, @Req() req) {
    const userId = req.user._id;
    return this.listingService.deleteDraft(id, userId);
  }

  // it will delete both draft and published listing
  @Delete('draft/:id/delete')
  async deleteList(@Param('id') id, @Req() req) {
    const userId = req.user._id;
    return this.listingService.deleteList(id, userId);
  }

  @Get(':id')
  async getListing(@Param('id') id: string) {
    return this.listingService.getListingById(id);
  }

  @Get('similar/:id')
  async getSimilar(@Param('id') id: string) {
    return this.listingService.getSimilarListings(id);
  }

  @Patch('renew/:id')
  async renewListing(@Param('id') id, @Req() req) {
    const userId = req.user._id;
    return this.listingService.renewListing(userId, id);
  }


  @Post('report/:id')
  async reportListing(
    @Param('id') id: string,
    @Req() req: any,
    @Body('reason') reason: string,
    @Body('description') description?: string
  ) {
    const userId = req.user._id;
    return this.listingService.reportListing(userId, id, reason, description);
  }

  @Patch(':id')
  async editListing(
    @Req() req,
    @Param('id') listingId: string,
    @Body() dto: UpdateListingDto
  ) {
    return this.listingService.updateListing(req.user._id, listingId, dto);
  }

  @Patch(':id/visibility')
  async toggleVisibility(
    @Req() req,
    @Param('id') listingId: string,
    @Body('hide') hide: boolean
  ) {
    if (typeof hide !== 'boolean') {
      throw new BadRequestException('Hide status must be a boolean');
    }
    return this.listingService.setListingVisibility(req.user._id, listingId, hide);
  }

  @Get('negotiation-options/:listingId')
  async getNegotiationOptions(@Param('listingId') id: string) {
    const listing = await this.listingService.findById(id);
    const price = listing.price;

    return {
      listingId: id,
      originalPrice: price,
      quickOffers: [
        { label: "5% Off", value: price * 0.95 },
        { label: "10% Off", value: price * 0.90 },
        { label: "Lowball (15% Off)", value: price * 0.85 }
      ]
    };
  }


}
