import { Module } from '@nestjs/common';
import { AuthModule } from 'src/api/auth/auth.module';
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
