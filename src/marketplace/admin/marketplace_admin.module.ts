import { Module } from "@nestjs/common";
import { MarketPlaceAdminController } from "./marketplace_admin.controller";
import { MarketPlaceAdminService } from "./marketplace_admin.service";
import { MailEmitterModule } from "src/api/mail/mail.emitter.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ListingSchema } from "../listing/entity/listing.entity";
import { marketUserSchema } from "../user/entity/market_user.entity";
import { AuthModule } from "src/api/auth/auth.module";


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Listing", schema: ListingSchema },
      { name: 'MarketUser', schema: marketUserSchema },
    ]),
    MailEmitterModule,
    AuthModule
  ],
  exports: [],
  controllers: [MarketPlaceAdminController],
  providers: [MarketPlaceAdminService]
})

export class MarketPlaceAdminModule { }