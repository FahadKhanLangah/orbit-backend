import { Module } from '@nestjs/common';
import { ListingModule } from './listing/listing.module';
import { MarketPlaceUser } from './user/marketuser.module';

@Module({
  imports: [
    ListingModule,
    MarketPlaceUser,
  ],
  controllers: [],
  providers: []
})
export class MarketplaceModule { }
