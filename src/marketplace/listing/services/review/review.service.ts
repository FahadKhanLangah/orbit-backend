import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { IReview } from './entity/review.entity';
import { IMarketUser } from 'src/marketplace/user/entity/market_user.entity';
import { CreateReviewDto } from './dto/create-review.dto';


@Injectable()
export class ReviewService {
  constructor(
    @InjectModel('Review') private readonly reviewModel: Model<IReview>,
    @InjectModel('MarketUser') private readonly marketUserModel: Model<IMarketUser>,
  ) { }

  async addReview(reviewerId: string, dto: CreateReviewDto) {
    if (reviewerId.toString() === dto.sellerId.toString()) {
      throw new BadRequestException("You cannot review yourself.");
    }

    // 2. Check if already reviewed this specific listing
    const existing = await this.reviewModel.findOne({
      reviewer: reviewerId,
      listing: dto.listingId
    });
    if (existing) {
      throw new BadRequestException("You have already reviewed this transaction.");
    }

    // 3. Create the review
    const review = await this.reviewModel.create({
      reviewer: reviewerId,
      reviewee: dto.sellerId,
      listing: dto.listingId,
      rating: dto.rating,
      comment: dto.comment
    });

    // 4. Update the Seller's Average Rating
    await this.updateSellerRating(dto.sellerId);

    return review;
  }

  async getSellerReviews(sellerId: string) {
    return this.reviewModel
      .find({ reviewee: sellerId })
      .populate('reviewer', 'firstName lastName avatar') // Show who wrote it
      .populate('listing', 'title') // Context: "Reviewed on iPhone 13 Pro"
      .sort({ createdAt: -1 });
  }

  // --- INTERNAL HELPER: Aggregation Pipeline ---
  private async updateSellerRating(sellerId: string) {
    const stats = await this.reviewModel.aggregate([
      { $match: { reviewee: new mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: '$reviewee',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await this.marketUserModel.findOneAndUpdate(
        { userId: sellerId },
        {
          'rating.average': stats[0].avgRating.toFixed(1),
          'rating.count': stats[0].totalReviews
        }
      );
    }
  }
}