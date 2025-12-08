// listing.controller.ts
import {  Post, UseGuards, UseInterceptors, UploadedFiles, Req, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostListingDto } from './dto/post-listing.dto';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { V1Controller } from 'src/core/common/v1-controller.decorator';
import { ListingServices } from './listing.service';

@UseGuards(VerifiedAuthGuard)
@V1Controller('listing')
@UsePipes(new ValidationPipe({ transform: true }))
export class ListingController {
  constructor(private readonly listingService: ListingServices) {}

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
}
