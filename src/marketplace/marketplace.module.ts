import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketUser, marketUserSchema } from './entity/market_user.entity';
import { MarketPlaceService } from './marketplace.service';
import { AuthModule } from 'src/api/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketUser.name, schema: marketUserSchema }
    ]),
    AuthModule
  ],
  controllers: [MarketplaceController],
  providers: [MarketPlaceService]
})
export class MarketplaceModule { }
