import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IListing } from '../listing/entity/listing.entity';
import { MailEmitterService } from 'src/api/mail/mail.emitter.service';
import { IMarketUser } from '../user/entity/market_user.entity';


@Injectable()
export class MarketPlaceAdminService {
  constructor(
    @InjectModel('MarketUser') private userModel: Model<IMarketUser>,
    @InjectModel('Listing') private listingModel: Model<IListing>,
    private mailEmitter: MailEmitterService
  ) { }

  // 1. Warn User
  async warnUser(userId: string, reason: string) {
    const user = await this.userModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          warnings: { reason, date: new Date() }
        }
      },
      { new: true }
    );

    if (!user) throw new NotFoundException('User not found');

    // Notify User
    // await this.mailEmitter.sendEmailNotification(user, 'warning', { reason });

    return user;
  }

  // 2. Ban User
  async banUser(userId: string, reason: string) {
    const user = await this.userModel.findOneAndUpdate(
      { userId },
      {
        isBanned: true,
        banReason: reason
      },
      { new: true }
    );

    return user;
  }

  // 3. Unban User
  async unbanUser(userId: string) {
    return this.userModel.findOneAndUpdate(
      { userId },
      {
        isBanned: false,
        banReason: null
      },
      { new: true }
    );
  }

  // 4. Remove (Ban) Listing
  async banListing(listingId: string, reason: string) {
    const listing = await this.listingModel.findByIdAndUpdate(
      listingId,
      {
        status: 'banned',
        adminNote: `Banned: ${reason}`
      },
      { new: true }
    );
    return listing;
  }

  async adminEditListing(listingId: string, updateDto: any) {
    return this.listingModel.findByIdAndUpdate(listingId, updateDto, { new: true });
  }

  async getAllUsers() {
    return this.userModel.find().populate('userId', 'fullName email').lean();
  }

}