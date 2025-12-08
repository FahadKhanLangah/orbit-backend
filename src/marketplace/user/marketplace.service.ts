import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IMarketUser, MarketUser } from "./entity/market_user.entity";
import { CreateMarketUserDto } from "./dto/create-marketUser.dto";



@Injectable()
export class MarketPlaceService {
  constructor(
    @InjectModel(MarketUser.name)
    private readonly marketPlaceUserModel: Model<IMarketUser>
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
}