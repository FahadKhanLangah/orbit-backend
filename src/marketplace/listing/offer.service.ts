import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { IOffer, OfferStatus } from "./entity/offer.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class OfferService {
  constructor(@InjectModel('Offer') private offerModel: Model<IOffer>) { }

  async makeOffer(listingId: string, buyerId: string, sellerId: string, price: number) {
    const existing = await this.offerModel.findOne({
      listing: listingId, buyer: buyerId, status: { $in: ['pending', 'countered'] }
    });

    if (existing) {
      existing.price = price;
      existing.status = OfferStatus.PENDING;
      existing.history.push({ action: 'offer', price, by: buyerId });
      return existing.save();
    }

    return this.offerModel.create({
      listing: listingId,
      buyer: buyerId,
      seller: sellerId,
      price: price,
      history: [{ action: 'offer', price, by: buyerId }]
    });
  }

  async respondToOffer(offerId: string, userId: string, action: 'accept' | 'reject' | 'counter', newPrice?: number) {
    const offer = await this.offerModel.findById(offerId);
    if (!offer) throw new NotFoundException('Offer not found');

    if (action === 'accept') {
      offer.status = OfferStatus.ACCEPTED;
    }
    else if (action === 'reject') {
      offer.status = OfferStatus.REJECTED;
    }
    else if (action === 'counter') {
      if (!newPrice) throw new BadRequestException('Counter offer must have a price');
      offer.status = OfferStatus.COUNTERED;
      offer.price = newPrice;
      offer.history.push({ action: 'counter', price: newPrice, by: userId });
    }

    return offer.save();
  }
}