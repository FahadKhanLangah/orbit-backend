import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MarketUser, marketUserSchema } from "./entity/market_user.entity";
import { AuthModule } from "src/api/auth/auth.module";
import { MarketplaceController } from "./marketplace.controller";
import { MarketPlaceService } from "./marketplace.service";


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "MarketUser", schema: marketUserSchema }
    ]),
    AuthModule
  ],
  controllers: [MarketplaceController],
  providers: [MarketPlaceService]
})
export class MarketPlaceUserModule { }
