import {
  Injectable,
  BadRequestException,
  Inject,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import { Ad, AdStatus } from "./schema/ad.schema";

import { FileUploaderService } from "src/common/file_uploader/file_uploader.service";

import { CreateAdDto } from "./dto/create-ad.dto";

// You might need a utility for image processing like 'sharp'
// npm install sharp
import * as sharp from "sharp";
import { UserService } from "../user_modules/user/user.service";
import { IUser } from "../user_modules/user/entities/user.entity";
import { SettingsService } from "../setting/settings.service";
import { TransactionService } from "../transactions/transaction.service";
import { TransactionType } from "../transactions/schemas/transaction.schema";

@Injectable()
export class AdService {
  constructor(
    @InjectModel(Ad.name) private readonly adModel: Model<Ad>,
    private readonly settingsService: SettingsService,
    private readonly transactionService: TransactionService,
    private readonly fileUploaderService: FileUploaderService,
    private readonly userService: UserService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async getAdConfig() {
    const settings = await this.settingsService.getSettings();
    return {
      pricePerMinute: settings.adPricePerMinute,
      requiredDimensions: settings.adRequiredDimensions,
    };
  }

  async getActiveAds() {
    return this.adModel
      .find({ status: AdStatus.ACTIVE })
      .select("imageUrl linkUrl -_id") // Only return the fields needed by the app
      .exec();
  }

  async createAd(
    user: any,
    dto: CreateAdDto,
    file: Express.Multer.File
  ): Promise<Ad> {
    if (!file) {
      throw new BadRequestException("Ad image is required.");
    }
    const settings = await this.settingsService.getSettings();
    const totalCost = dto.durationInMinutes * settings.adPricePerMinute;
    const currentUser = await this.userService.findById(user._id);
    if (!currentUser || currentUser.balance < totalCost) {
      throw new ForbiddenException("Insufficient balance to purchase this ad.");
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 4. Upload the ad image
      const imageUrl = await this.fileUploaderService.uploadAdImage(
        file,
        currentUser._id.toString()
      );

      // 5. Deduct balance from user (IMPORTANT: This method needs to exist in your UserService)
      // It should accept a session to be part of the transaction.
      await this.userService.deductBalance(currentUser._id, totalCost, {
        session,
      });

      // 6. Create the AD_PURCHASE transaction record
      await this.transactionService.create(
        {
          userId: currentUser._id,
          amount: totalCost,
          type: TransactionType.AD_PURCHASE,
          description: `Ad purchase for ${dto.durationInMinutes} minutes.`,
          // For a direct service purchase, system gets 100% of the amount
          commissionPercentage: 100,
          metadata: {
            durationInMinutes: dto.durationInMinutes,
            linkUrl: dto.linkUrl,
          },
        },
        session
      );

      // 7. Calculate start and end times
      const startTime = new Date();
      const endTime = new Date(
        startTime.getTime() + dto.durationInMinutes * 60000
      );

      // 8. Create and save the new Ad document
      const newAd = new this.adModel({
        userId: currentUser._id,
        imageUrl: imageUrl, // The key returned by the uploader
        linkUrl: dto.linkUrl,
        startTime: startTime,
        endTime: endTime,
        status: AdStatus.ACTIVE, // Set to active immediately upon successful payment
      });

      const savedAd = await newAd.save({ session });

      // 9. If everything is successful, commit the transaction
      await session.commitTransaction();
      return savedAd;
    } catch (error) {
      // 10. If any step fails, abort the transaction
      await session.abortTransaction();
      // You should also add logic here to delete the uploaded file if it exists
      throw error; // Re-throw the error to be handled by NestJS
    } finally {
      // 11. End the session
      session.endSession();
    }
  }
}
