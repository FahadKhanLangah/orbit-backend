// src/orbit-channel/orbit-channel.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PaginateModel, PaginateOptions } from "mongoose";
import { IOrbitChannel } from "./entities/orbit-channel.entity";
import { IUser } from "../api/user_modules/user/entities/user.entity"; // Adjust path if needed
import {
  CreateOrbitChannelDto,
  UpdateOrbitChannelDto,
} from "./dto/orbit.channel.dto";
import { IChannelMember } from "./entities/channel-member.entity";
import { FileUploaderService } from "src/common/file_uploader/file_uploader.service";

@Injectable()
export class OrbitChannelService {
  constructor(
    @InjectModel("OrbitChannel")
    private readonly orbitChannelModel: PaginateModel<IOrbitChannel>,
    @InjectModel("ChannelMember")
    private readonly channelMemberModel: PaginateModel<IChannelMember>,
    private readonly fileUploaderService: FileUploaderService,
  ) {}

  async createChannel(
    createDto: CreateOrbitChannelDto,
    owner: IUser
  ): Promise<IOrbitChannel> {
    const newChannel = new this.orbitChannelModel({
      ...createDto,
      ownerId: owner._id,
    });
    return await newChannel.save();
  }
  async getChannels(options: { page: number; limit: number }) {
    return await this.orbitChannelModel.paginate({}, options);
  }
  async joinChannel(channelId: string, user: IUser): Promise<IChannelMember> {
    const channelExists = await this.orbitChannelModel.findById(channelId);
    if (!channelExists) {
      throw new NotFoundException("Channel not found");
    }
    const existingMembership = await this.channelMemberModel.findOne({
      channelId,
      userId: user._id,
    });
    if (existingMembership) {
      throw new ConflictException("You are already a member of this channel");
    }
    const newMember = new this.channelMemberModel({
      channelId,
      userId: user._id,
    });
    return await newMember.save();
  }

  async getPublicChannelDetails(channelId: string) {
    const channel = await this.orbitChannelModel.findById(channelId).lean();
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }
    const memberCount = await this.channelMemberModel.countDocuments({
      channelId,
    });
    return { ...channel, memberCount };
  }

  async getMyChannels(owner: IUser, options: PaginateOptions) {
    const query = { ownerId: owner._id };
    return await this.orbitChannelModel.paginate(query, options);
  }

  async updateChannel(
    channelId: string,
    updateDto: UpdateOrbitChannelDto,
    requestingUser: IUser
  ): Promise<IOrbitChannel> {
    // 1. Find the channel we want to update.
    const channel = await this.orbitChannelModel.findById(channelId);
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    // 2. Authorization Check: Is the person making the request the owner?
    if (channel.ownerId.toString() !== requestingUser._id.toString()) {
      throw new ForbiddenException("You are not the owner of this channel.");
    }

    // 3. If the check passes, update the channel.
    // The { new: true } option ensures that the updated document is returned.
    const updatedChannel = await this.orbitChannelModel.findByIdAndUpdate(
      channelId,
      { $set: updateDto }, // Using $set is efficient and safe
      { new: true }
    );

    return updatedChannel;
  }

  async getChannelMembersForOwner(
    channelId: string,
    requestingUser: IUser,
    options: PaginateOptions // For pagination
  ) {
    // 1. First, find the channel itself.
    const channel = await this.orbitChannelModel.findById(channelId);
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    // 2. Authorization Check: Is the person asking for the data the owner?
    // We compare the channel's ownerId with the ID of the logged-in user.
    if (channel.ownerId.toString() !== requestingUser._id.toString()) {
      throw new ForbiddenException("You are not the owner of this channel.");
    }

    // 3. If the check passes, fetch the members with pagination.
    const query = { channelId: channelId };

    // We create a custom options object for pagination to include the populate command.
    const paginationWithOptions = {
      ...options,
      // 4. This is the magic! Populate the 'userId' field with selected user details.
      // This is a crucial security step to avoid sending the password hash or other sensitive data.
      populate: {
        path: "userId",
        select: "fullName fullNameEn email userImage phoneNumber",
      },
      lean: true, // Performance optimization
    };

    // 5. Paginate the ChannelMember collection, not the User collection.
    return await this.channelMemberModel.paginate(query, paginationWithOptions);
  }
   async updateChannelImage(
    channelId: string,
    requestingUser: IUser,
    file: Express.Multer.File,
  ): Promise<IOrbitChannel> {
    // Step A: Authorize the user (same logic as our updateChannel method)
    const channel = await this.orbitChannelModel.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    if (channel.ownerId.toString() !== requestingUser._id.toString()) {
      throw new ForbiddenException('You are not the owner of this channel.');
    }

    // Step B: Use your file uploader service to save the file
    // The `putImageCropped` method looks perfect for this. It returns the filename (key).
    const imageKey = await this.fileUploaderService.putImageCropped(
      file.buffer,
      requestingUser._id.toString(),
    );

    // Step C: Update the channel document in the database with the new image key
    const updatedChannel = await this.orbitChannelModel.findByIdAndUpdate(
      channelId,
      { $set: { image: imageKey } },
      { new: true },
    );

    return updatedChannel;
  }
}
