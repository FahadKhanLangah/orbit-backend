import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ISubscriptionPlan } from '../user_modules/user/entities/subscription_plan.entity';
import { CreateSubscriptionPlanDto } from 'src/core/common/dto/subscription.plan.dto';
import { UpdateSubscriptionPlanDto } from 'src/core/common/dto/update-subscription-plan.dto';


@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectModel('SubscriptionPlan')
    private readonly subscriptionPlanModel: Model<ISubscriptionPlan>,
  ) {}

  async create(dto: CreateSubscriptionPlanDto): Promise<ISubscriptionPlan> {
    const newPlan = new this.subscriptionPlanModel(dto);
    return await newPlan.save();
  }

  async findAll(): Promise<ISubscriptionPlan[]> {
    return this.subscriptionPlanModel.find().exec();
  }
  async findOne(id: string): Promise<ISubscriptionPlan> {
    const plan = await this.subscriptionPlanModel.findById(id).exec();
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID "${id}" not found.`);
    }
    return plan;
  }

  /**
   * Updates a subscription plan (used for editing and disabling/enabling)
   */
  async update(id: string, dto: UpdateSubscriptionPlanDto): Promise<ISubscriptionPlan> {
    const updatedPlan = await this.subscriptionPlanModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updatedPlan) {
      throw new NotFoundException(`Subscription plan with ID "${id}" not found.`);
    }
    return updatedPlan;
  }
}