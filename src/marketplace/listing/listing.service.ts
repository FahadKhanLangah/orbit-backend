// listing.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IListing, Listing } from './entity/listing.entity';
import { PostListingDto } from './dto/post-listing.dto';
import { FileUploaderService } from 'src/common/file_uploader/file_uploader.service';

@Injectable()
export class ListingServices {
  constructor(
    @InjectModel(Listing.name) private readonly listingModel: Model<IListing>,
    private readonly fileUploaderServices: FileUploaderService
  ) {}
  async postListing(userId: string, dto: PostListingDto, files?: { images?: Express.Multer.File[], video?: Express.Multer.File[] }) {
    const imageKeys: string[] = [];
    if (files?.images && files.images.length > 0) {
      for (const file of files.images) {
        if (!file.buffer) continue;
        const key = await this.fileUploaderServices.uploadMediaFile(file, 'listings/images', userId, true);
        imageKeys.push(key);
      }
    }
    let videoKey: string | undefined;
    if (files?.video && files.video.length > 0) {
      const vidFile = files.video[0];
      if (!vidFile.buffer) throw new BadRequestException('Video file buffer is missing');
      videoKey = await this.fileUploaderServices.uploadMediaFile(vidFile, 'listings/videos', userId, true);
    }
    const doc: Partial<IListing> = {
      postBy: userId as any,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      category: dto.category,
      condition: dto.condition,
      location: dto.location ? {
        latitude: dto.location.latitude,
        longitude: dto.location.longitude,
        address: dto.location.address,
      } : undefined,
      expiry: dto.expiry,
      image: imageKeys,
      video: videoKey,
    };
    const created = await this.listingModel.create(doc);
    return created;
  }

  
}
