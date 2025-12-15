import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IMarketUser, MarketUser } from "./entity/market_user.entity";
import { CreateMarketUserDto } from "./dto/create-marketUser.dto";
import { IMarketUserActivity } from "./entity/market_user_activity.entity";



@Injectable()
export class MarketPlaceService {
  constructor(
    @InjectModel("MarketUser")
    private readonly marketPlaceUserModel: Model<IMarketUser>,
  ) { }

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
}