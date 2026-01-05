import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BadgeType, IMarketUser, MarketUser } from "./entity/market_user.entity";
import { CreateMarketUserDto } from "./dto/create-marketUser.dto";
import { IMarketUserActivity } from "./entity/market_user_activity.entity";
import { ISavedSearch } from "./entity/saved-search.entity";
import { SaveSearchDto } from "./dto/save-search.dto";
import { Cron, CronExpression } from "@nestjs/schedule";



@Injectable()
export class MarketPlaceService {
  constructor(
    @InjectModel("MarketUser")
    private readonly marketPlaceUserModel: Model<IMarketUser>,
    @InjectModel('SavedSearch')
    private readonly savedSearchModel: Model<ISavedSearch>,
  ) { }

  async submitBreederLicense(userId: string, licenseNumber: string, documentKey: string) {
    return this.marketPlaceUserModel.findOneAndUpdate(
      { userId: userId },
      {
        breederLicense: {
          licenseNumber,
          documentImage: documentKey,
          status: 'pending',
          submittedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );
  }

  async getBreaderListforVerification(status: 'pending' | 'approved' | 'rejected' = 'pending') {
    const breaderList = this.marketPlaceUserModel.find({
      'breederLicense.status': status
    })
      .populate('userId', 'fullName email userImage')
      .sort({ 'breederLicense.submittedAt': 1 });
    if (!breaderList) {
      throw new NotFoundException("No Breader List for verification is present");
    }
    return breaderList;
  }

  async approveBreeder(targetUserId: string) {
    const user = await this.marketPlaceUserModel.findOne({ userId: targetUserId });
    if (!user) throw new NotFoundException("User not found");
    user.breederLicense.status = 'approved';
    if (!user.badges.includes(BadgeType.VERIFIED_BREEDER)) {
      user.badges.push(BadgeType.VERIFIED_BREEDER);
    }
    return user.save();
  }

  async createProfile(createMarketUserDto: CreateMarketUserDto) {
    const existingMarketUser = await this.marketPlaceUserModel.findOne({ userId: createMarketUserDto.userId })
    if (existingMarketUser) {
      throw new ConflictException("You have already your marketplace profile. Login Now");
    }
    return await this.marketPlaceUserModel.create(
      {
        bio: createMarketUserDto.bio,
        userId: createMarketUserDto.userId,
        role: createMarketUserDto.role
      }
    )
  }

  async getMarkerUserProfile(userId: string) {
    return this.marketPlaceUserModel.findOne({ userId }).populate({
      path: "userId",
      select: "userImage phoneNumber gender countryId"
    })
  }

  async addUserListing(userId, listingId) {
    return this.marketPlaceUserModel.findOneAndUpdate(
      { userId: userId },
      { $addToSet: { savedListings: listingId } },
      { new: true, upsert: true }
    );
  }

  async removeSavedListing(userId, listingId) {
    return this.marketPlaceUserModel.findOneAndUpdate(
      { userId: userId },
      { $pull: { savedListings: listingId } },
      { new: true }
    );
  }

  async getSavedListing(userId) {
    const savedList = await this.marketPlaceUserModel.findOne({ userId: userId }).populate('savedListings');
    if (!savedList) {
      throw new NotFoundException("No List found");
    }
    return savedList;
  }

  async createSavedSearch(userId: string, dto: SaveSearchDto) {
    return this.savedSearchModel.create({
      user: userId,
      ...dto
    });
  }

  async getUserSavedSearches(userId: string) {
    return this.savedSearchModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async deleteSavedSearch(userId: string, searchId: string) {
    return this.savedSearchModel.findOneAndDelete({ _id: searchId, user: userId });
  }

  async blockUser(myUserId: string, targetUserId: string) {
    return this.marketPlaceUserModel.findOneAndUpdate(
      { userId: myUserId },
      { $addToSet: { blockedUsers: targetUserId } },
      { new: true, upsert: true }
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateBadges() {

    await this.marketPlaceUserModel.updateMany(
      {
        salesCount: { $gte: 50 },
        'rating.average': { $gte: 4.5 }
      },
      { $addToSet: { badges: BadgeType.TOP_SELLER } }
    );

    await this.marketPlaceUserModel.updateMany(
      {
        $or: [{ salesCount: { $lt: 50 } }, { 'rating.average': { $lt: 4.5 } }]
      },
      { $pull: { badges: BadgeType.TOP_SELLER } }
    );
  }

}