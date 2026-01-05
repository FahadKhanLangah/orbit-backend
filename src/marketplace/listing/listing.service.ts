// listing.service.ts
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IListing, Listing, ListingStatus, PricingStructure } from './entity/listing.entity';
import { PostListingDto, SaveListingDraftDto } from './dto/post-listing.dto';
import { FileUploaderService } from 'src/common/file_uploader/file_uploader.service';
import { ListingQueryDto } from './dto/listing-query.dto';
import { Cron } from '@nestjs/schedule';
import { ISearchHistory } from './dto/search-history.entity';
import { IMarketUser } from '../user/entity/market_user.entity';
import { IReport } from './entity/report.entity';
import { IListingEngagement } from './entity/user-engagement.entity';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ContentModerationService } from 'src/common/services/content-moderation.service';
import { NotificationEmitterAdminService } from 'src/api/admin_panel/other/notification_emitter_admin.service';
import { CreateAdminNotificationDto } from 'src/api/admin_notification/dto/create-admin_notification.dto';

@Injectable()
export class ListingServices {
  constructor(
    @InjectModel("Listing") private readonly listingModel: Model<IListing>,
    @InjectModel('SearchHistory') private readonly searchHistoryModel: Model<ISearchHistory>,
    @InjectModel("MarketUser")
    private readonly marketPlaceUserModel: Model<IMarketUser>,
    @InjectModel("Report") private readonly reportModel: Model<IReport>,
    @InjectModel('ListingEngagement') private readonly engagementModel: Model<IListingEngagement>,
    private readonly moderationService: ContentModerationService,
    private readonly fileUploaderServices: FileUploaderService,
  ) { }

  async postListing(userId: string, dto: PostListingDto, files?: { images?: Express.Multer.File[], video?: Express.Multer.File[] }) {
    const fullText = `${dto.title} ${dto.description || ''}`;
    this.moderationService.checkProhibitedContent(fullText);
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
      status: ListingStatus.ACTIVE,
      propertyDetails: dto.propertyDetails,
      transactionType: dto.transactionType
    };
    if (dto.location) {
      const geoLocation = dto.location.toGeoJSON();
      doc.location = geoLocation;
    }
    if (dto.deliveryOptions) {
      doc.deliveryOptions = dto.deliveryOptions;
    }
    if (dto.vehicleDetails) {
      doc.vehicleDetails = dto.vehicleDetails;
    }
    if (dto.clothingDetails) {
      doc.clothingDetails = dto.clothingDetails;
    }
    if (dto.petDetails) {
      doc.clothingDetails = dto.clothingDetails;
    }
    const created = await this.listingModel.create(doc);
    this.checkAndNotifyUsers(created).catch(err => console.error(err));
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
    const fullText = `${dto.title} ${dto.description || ''}`;
    this.moderationService.checkProhibitedContent(fullText);
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

  async searchListings(query: ListingQueryDto, userId?: string) {
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
      sort,
      transactionType, propertyType, bedrooms, bathrooms,
      minSqFt, furnishing, amenities, make, model, minYear, maxMileage, transmission, fuel,
      brand, hasWarranty, size, color, animalType, breed
    } = query;
    const filter: any = { status: ListingStatus.ACTIVE };
    if (userId) {
      const userProfile = await this.marketPlaceUserModel.findOne({ userId });
      if (userProfile?.blockedUsers?.length) {
        filter.postBy = { $nin: userProfile.blockedUsers }; // Exclude these sellers
      }
      this.logSearchHistory(userId, query).catch(err => console.error('Search log error', err));
    }

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (city) filter["location.address"] = new RegExp(city, "i");
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }
    if (condition) filter.condition = condition;

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
    if (transactionType) {
      filter.transactionType = transactionType;
    }

    // 57. Property Type (Nested field)
    if (propertyType) {
      filter['propertyDetails.type'] = propertyType;
    }

    if (bedrooms) {
      filter['propertyDetails.bedrooms'] = { $gte: bedrooms };
    }
    if (bathrooms) {
      filter['propertyDetails.bathrooms'] = { $gte: bathrooms };
    }
    if (minSqFt) {
      filter['propertyDetails.areaSqFt'] = { $gte: minSqFt };
    }
    if (furnishing) {
      filter['propertyDetails.furnishing'] = furnishing;
    }

    if (amenities) {
      const amenitiesArray = amenities.split(',');

      filter['propertyDetails.amenities'] = {
        $all: amenitiesArray
      };
    }

    if (make) {
      filter['vehicleDetails.make'] = new RegExp(make, 'i');
    }
    if (model) {
      filter['vehicleDetails.model'] = new RegExp(model, 'i');
    }

    if (minYear) {
      filter['vehicleDetails.year'] = { $gte: minYear };
    }

    if (maxMileage) {
      filter['vehicleDetails.mileage'] = { $lte: maxMileage };
    }

    if (transmission) {
      filter['vehicleDetails.transmission'] = transmission;
    }

    if (fuel) {
      filter['vehicleDetails.fuel'] = fuel;
    }
    if (size) {
      filter['clothingDetails.size'] = size;
    }
    if (color) {
      filter['clothingDetails.color'] = new RegExp(color, 'i');
    }
    if (animalType) {
      filter['petDetails.animalType'] = new RegExp(animalType, 'i');
    }
    if (hasWarranty) {
      filter['clothingDetails.hasWarranty'] = hasWarranty;
    }
    if (brand) {
      filter['clothingDetails.brand'] = brand;
    }

    if (breed) {
      filter['petDetails.breed'] = new RegExp(breed, 'i');
    }

    const skip = (page - 1) * limit;
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

  async getListingById(id: string) {
    const listing = await this.listingModel.findById(id);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    listing.impressions.totalImpressions += 1;
    await listing.save();

    return listing;
  }

  async getSimilarListings(listingId: string) {
    const original = await this.listingModel.findById(listingId);
    if (!original) throw new NotFoundException('Listing not found');
    const minPrice = original.price ? original.price * 0.8 : 0;
    const maxPrice = original.price ? original.price * 1.2 : 1000000;
    const similar = await this.listingModel.find({
      _id: { $ne: original._id },
      category: original.category,
      status: 'active',
      hide: false,
      price: { $gte: minPrice, $lte: maxPrice }
    })
      .sort({ createdAt: -1 })
      .limit(6);
    if (similar.length === 0) {
      return this.listingModel.find({
        _id: { $ne: original._id },
        category: original.category,
        status: 'active',
        hide: false
      }).limit(6);
    }

    return similar;
  }

  async renewListing(userId: string, listingId: string) {
    const listing = await this.listingModel.findOne({ _id: listingId, postBy: userId });
    if (!listing) throw new NotFoundException("Listing not found or unauthorized");

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);

    listing.expiryDate = newExpiry;
    listing.isExpired = false;
    if (listing.status === 'expired') listing.status = 'active'; // Reactivate

    return listing.save();
  }

  async reportListing(userId: string, listingId: string, reason: string, description?: string) {
    const listing = await this.listingModel.findById(listingId);
    if (!listing) throw new NotFoundException("Listing not found");
    const report = await this.reportModel.create({
      reporter: userId as any,
      listing: listingId as any,
      reason,
      description
    });
    return report;
  }

  async getReports() {
    const reports = await this.reportModel.find().populate('reporter').populate('listing');
    return reports;
  }

  async recordView(userId: string, listingId: string) {
    return this.engagementModel.findOneAndUpdate(
      { user: userId, listing: listingId },
      {
        $set: { viewedAt: new Date() },
        $setOnInsert: { isLiked: false }
      },
      { upsert: true, new: true }
    );
  }

  async toggleLike(userId: string, listingId: string) {
    const engagement = await this.engagementModel.findOne({ user: userId, listing: listingId });

    const isCurrentlyLiked = engagement ? engagement.isLiked : false;
    const newState = !isCurrentlyLiked;

    return this.engagementModel.findOneAndUpdate(
      { user: userId, listing: listingId },
      {
        $set: {
          isLiked: newState,
          favoritedAt: newState ? new Date() : undefined
        },
        $setOnInsert: { viewedAt: new Date() }
      },
      { upsert: true, new: true }
    );
  }

  async recordInquiry(userId: string, listingId: string) {
    return this.engagementModel.findOneAndUpdate(
      { user: userId, listing: listingId },
      { $set: { contactedAt: new Date() } },
      { upsert: true, new: true }
    );
  }

  async getStatsForListing(listingId: string) {
    const stats = await this.engagementModel.aggregate([
      { $match: { listing: new Types.ObjectId(listingId) } },
      {
        $group: {
          _id: '$listing',
          totalUniqueViews: { $sum: 1 },
          totalLikes: {
            $sum: { $cond: [{ $eq: ['$isLiked', true] }, 1, 0] }
          },
          totalInquiries: {
            $sum: { $cond: [{ $ifNull: ['$contactedAt', false] }, 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || { totalUniqueViews: 0, totalLikes: 0, totalInquiries: 0 };
  }

  async getSellerOverallStats(sellerListingIds: string[]) {
    const objectIds = sellerListingIds.map(id => new Types.ObjectId(id));

    return this.engagementModel.aggregate([
      { $match: { listing: { $in: objectIds } } },
      {
        $group: {
          _id: null, // Group everything together
          totalViews: { $sum: 1 },
          totalLikes: { $sum: { $cond: ['$isLiked', 1, 0] } },
          totalInquiries: { $sum: { $cond: [{ $ifNull: ['$contactedAt', false] }, 1, 0] } }
        }
      }
    ]);
  }

  async updateListing(userId: string, listingId: string, dto: UpdateListingDto) {
    const fullText = `${dto.title} ${dto.description || ''}`;
    this.moderationService.checkProhibitedContent(fullText);
    const listing = await this.listingModel.findById(listingId);

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.postBy.toString() !== userId.toString()) {
      throw new ForbiddenException('You are not allowed to edit this listing');
    }

    listing.set(dto);
    return await listing.save();
  }

  async setListingVisibility(userId: string, listingId: string, shouldHide: boolean) {
    const listing = await this.listingModel.findById(listingId);

    if (!listing) throw new NotFoundException('Listing not found');

    if (listing.postBy.toString() !== userId.toString()) {
      throw new ForbiddenException('You are not allowed to hide this listing');
    }

    listing.hide = shouldHide;
    listing.status = shouldHide ? ListingStatus.INACTIVE : ListingStatus.ACTIVE;
    return await listing.save();
  }

  async findById(listingId: string) {
    return this.listingModel.findById(listingId);
  }

  async compareListings(ids: string[]) {
    if (!ids || ids.length < 2) {
      throw new BadRequestException("Select at least 2 items to compare.");
    }
    if (ids.length > 3) {
      throw new BadRequestException("You can compare a maximum of 3 items.");
    }

    // 2. Fetch all listings
    const listings = await this.listingModel.find({ _id: { $in: ids } });

    if (listings.length !== ids.length) {
      throw new NotFoundException("One or more items could not be found.");
    }

    const firstCategory = listings[0].category;
    const isSameCategory = listings.every(item => item.category === firstCategory);

    if (!isSameCategory) {
      throw new BadRequestException("All items in comparison must be from the same category.");
    }

    return listings;
  }

  getPhotoGuidelines(category: string): string[] {
    const guidelines: Record<string, string[]> = {
      'vehicles': [
        'Front Corner (Best for cover)',
        'Rear Angle',
        'Interior / Dashboard',
        'Engine Bay',
        'Trunk / Boot',
        'Any Scratches/Dents'
      ],
      'electronics': [
        'Screen (On)',
        'Back / Model Number',
        'Ports / Connectors',
        'Accessories included'
      ],
      'real-estate': [
        'Living Room',
        'Kitchen',
        'Master Bedroom',
        'Bathroom',
        'Exterior / View'
      ],
      'furniture': [
        'Full View',
        'Texture/Fabric Detail',
        'Scale reference',
        'Defects (if any)'
      ]
    };

    // Return specific guidelines or a generic default
    return guidelines[category] || ['Front View', 'Back View', 'Label/Tags', 'Defects'];
  }

  private async logSearchHistory(userId: string, query: ListingQueryDto) {
    const { page, limit, sort, ...filtersToSave } = query;
    if (Object.keys(filtersToSave).length === 0) return;
    const searchString = filtersToSave.search || "";

    await this.searchHistoryModel.findOneAndUpdate(
      {
        user: userId,
        searchQuery: searchString,
      },
      {
        $set: {
          filters: filtersToSave,
          lastSearched: new Date()
        }
      },
      { upsert: true, new: true }
    );
  }

  private async checkAndNotifyUsers(listing: IListing) {
    if (listing.category !== 'vehicles' || !listing.vehicleDetails) return;

    const { make, model } = listing.vehicleDetails;
    const matchingSearches = await this.searchHistoryModel.find({
      isActive: true,
      alerts: true,
      'criteria.category': 'vehicles',
      'criteria.make': make,
      'criteria.model': { $regex: new RegExp(`^${model}$`, 'i') }
    }).populate('user', 'email fcmToken');

    for (const search of matchingSearches) {
      const user = search.user as any;
      const dto = new CreateAdminNotificationDto();
      // dto.title = 'New Vehicle Listing Alert';
      // dto.content = `A new ${make} ${model} listing has been posted that matches your alert criteria. Check it out now!`;
      // await this.notificationEmitterAdminService.emitNotification(dto);

      console.log(dto, user);
    }
  }

  @Cron('0 0 * * *')
  async resetDailyImpressions() {
    await this.listingModel.updateMany({}, {
      $set: { "impressions.inDays": 0 }
    });
  }
}
