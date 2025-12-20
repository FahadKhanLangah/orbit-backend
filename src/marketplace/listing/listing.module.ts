import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from './entity/listing.entity';
import { ListingServices } from './listing.service';
import { FileUploaderModule } from 'src/common/file_uploader/file_uploader.module';
import { AuthModule } from 'src/api/auth/auth.module';
import { SearchHistorySchema } from './dto/search-history.entity';
import { OfferSchema } from './entity/offer.entity';
import { OfferService } from './offer.service';
import { marketUserSchema } from '../user/entity/market_user.entity';
import { ReportSchema } from './entity/report.entity';
import { ListingAnalyticsController } from './listing-analytics.controller';
import { ListingEngagementSchema } from './entity/user-engagement.entity';
import { ReviewController } from './services/review/review.controller';
import { ReviewService } from './services/review/review.service';
import { ReviewSchema } from './services/review/entity/review.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Listing", schema: ListingSchema },
      { name: 'SearchHistory', schema: SearchHistorySchema },
      { name: 'Offer', schema: OfferSchema },
      { name: 'MarketUser', schema: marketUserSchema },
      { name: 'Report', schema: ReportSchema },
      { name: 'ListingEngagement', schema: ListingEngagementSchema },
      { name: 'Review', schema: ReviewSchema }
    ]),
    FileUploaderModule,
    AuthModule
  ],
  providers: [
    ListingServices, OfferService, ReviewService
  ],
  controllers: [ListingController, ListingAnalyticsController, ReviewController],
  exports: [ListingServices]
})
export class ListingModule { }
