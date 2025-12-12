// listing.service.ts
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IListing, Listing, ListingStatus, PricingStructure } from './entity/listing.entity';
import { PostListingDto, SaveListingDraftDto } from './dto/post-listing.dto';
import { FileUploaderService } from 'src/common/file_uploader/file_uploader.service';
import { ListingQueryDto } from './dto/listing-query.dto';

@Injectable()
export class ListingServices {
  constructor(
    @InjectModel(Listing.name) private readonly listingModel: Model<IListing>,
    private readonly fileUploaderServices: FileUploaderService
  ) { }

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
      pricing: dto.pricing ? dto.pricing : PricingStructure.FIXED,
      category: dto.category,
      condition: dto.condition,
      brand: dto.brand,
      expiry: dto.expiry,
      image: imageKeys,
      video: videoKey,
      status: ListingStatus.ACTIVE
    };
    if (dto.location) {
      const geoLocation = dto.location.toGeoJSON();
      doc.location = geoLocation;
    }
    const created = await this.listingModel.create(doc);
    return created;
  }

  async saveDraft(userId: string, dto: SaveListingDraftDto, files) {
    const images = [];
    let video = null;
    if (files?.images) {
      for (const img of files.images) {
        const key = await this.fileUploaderServices.uploadMediaFile(img, 'drafts/images', userId);
        images.push(key);
      }
    }

    if (files?.video?.[0]) {
      video = await this.fileUploaderServices.uploadMediaFile(files.video[0], 'drafts/videos', userId);
    }

    return this.listingModel.create({
      postBy: userId,
      ...dto,
      image: images,
      video,
      status: ListingStatus.DRAFT
    });
  }

  async getDrafts(userId, status) {
    const draftsListing = await this.listingModel.find({
      postBy: userId,
      status: status
    });
    if (draftsListing.length === 0) {
      throw new NotFoundException("You have no drafts");
    }
    return draftsListing;
  }

  async getListings(userId: string, query: any) {
    const {
      page = 1,
      limit = 10,
      search,
      minPrice,
      maxPrice,
      condition,
      category,
      brand,
      lat,
      lng,
      radius,
    } = query;

    const filter: any = {
      postBy: userId,
      status: ListingStatus.ACTIVE
    };

    if (search) {
      filter.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (condition) filter.condition = condition;
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (lat && lng && radius) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: Number(radius) * 1000
        }
      };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const listings = await this.listingModel
      .find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await this.listingModel.countDocuments(filter);

    return {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: listings
    };
  }


  async updateDraft(id: string, userId: string, dto: SaveListingDraftDto, files?: { images?: Express.Multer.File[], video?: Express.Multer.File[] }) {
    const draftPost = await this.listingModel.findById(id);

    if (!draftPost) {
      throw new NotFoundException("No Post with this ID exists");
    }
    if (draftPost.postBy.toString() !== userId.toString()) {
      throw new ForbiddenException("Not allowed to edit this draft");
    }
    if (draftPost.status !== ListingStatus.DRAFT) {
      throw new BadRequestException("Only draft posts can be edited");
    }

    const imageKeys: string[] = [];
    if (files?.images && files.images.length > 0) {
      for (const file of files.images) {
        if (!file.buffer) continue;
        const key = await this.fileUploaderServices.uploadMediaFile(file,
          draftPost.status === ListingStatus.DRAFT ? 'drafts/images' : 'listings/images',
          userId, true);
        imageKeys.push(key);
      }
    }
    let videoKey: string | undefined;
    if (files?.video && files.video.length > 0) {
      const vidFile = files.video[0];
      if (!vidFile.buffer) throw new BadRequestException('Video file buffer is missing');
      videoKey = await this.fileUploaderServices.uploadMediaFile(vidFile, 'listings/videos', userId, true);
    }
    if (imageKeys.length > 0) {
      draftPost.image.push(...imageKeys);
    }
    if (videoKey) {
      draftPost.video = videoKey;
    }
    if (dto.location) {
      const geoLocation = dto.location.toGeoJSON();

      draftPost.location = geoLocation;
    }

    Object.assign(draftPost, dto);
    await draftPost.save();
    return draftPost;
  }

  async publishDraft(id, userId) {
    const publishedDraft = await this.listingModel.findOneAndUpdate(
      { _id: id, postBy: userId },
      { status: ListingStatus.ACTIVE },
      { new: true }
    );
    return publishedDraft;
  }

  async deleteDraft(id, userId) {
    const draft = await this.listingModel.findOne({ _id: id, postBy: userId });
    if (!draft) {
      throw new NotFoundException("Draft with this ID does not exist");
    }
    await draft.deleteOne();
    return draft;
  }

  async deleteList(id, userId) {
    const draft = await this.listingModel.findOne({ _id: id, postBy: userId });
    if (!draft) {
      throw new NotFoundException("Draft with this ID does not exist");
    }
    await draft.deleteOne();
    return draft;
  }

  async searchListings(query: ListingQueryDto) {
    const {
      search,
      category,
      city,
      minPrice,
      maxPrice,
      condition,
      lat,
      lng,
      radius,
      page = 1,
      limit = 10,
      sort
    } = query;

    const filter: any = { status: ListingStatus.ACTIVE };
    if (search) filter.$text = { $search: search };

    //  Category Browsing
    if (category) filter.category = category;

    //  City Filter (based on stored text)
    if (city) filter["location.address"] = new RegExp(city, "i");

    //  Price Filters
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    //  Condition Filter
    if (condition) filter.condition = condition;

    //  Radius Filter
    if (lat && lng && radius) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius * 1000,
        },
      };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    const sortQuery: any = {};

    if (sort === "recent") sortQuery.createdAt = -1;
    if (sort === "priceLow") sortQuery.price = 1;
    if (sort === "priceHigh") sortQuery.price = -1;
    if (sort === "trending") sortQuery["impressions.totalImpressions"] = -1;

    const data = await this.listingModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortQuery);

    const total = await this.listingModel.countDocuments(filter);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

}
