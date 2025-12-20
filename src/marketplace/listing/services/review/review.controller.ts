import { Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { V1Controller } from 'src/core/common/v1-controller.decorator';


@UseGuards(VerifiedAuthGuard)
@V1Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @Post()
  async postReview(@Req() req, @Body() dto: CreateReviewDto) {
    return this.reviewService.addReview(req.user._id, dto);
  }

  @Get('seller/:id')
  async getReviewsForSeller(@Param('id') sellerId: string) {
    return this.reviewService.getSellerReviews(sellerId);
  }
}