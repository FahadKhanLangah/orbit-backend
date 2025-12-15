import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from './entity/listing.entity';
import { ListingServices } from './listing.service';
import { FileUploaderModule } from 'src/common/file_uploader/file_uploader.module';
import { AuthModule } from 'src/api/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Listing", schema: ListingSchema }
    ]),
    FileUploaderModule,
    AuthModule
  ],
  providers: [
    ListingServices
  ],
  controllers: [ListingController]
})
export class ListingModule { }
