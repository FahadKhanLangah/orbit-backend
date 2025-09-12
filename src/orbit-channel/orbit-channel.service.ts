// src/orbit-channel/orbit-channel.service.ts
import {
  BadRequestException,
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
import { OrbitChannelGateway } from "./orbit-channel.gateway";
import { IChannelMessage } from "./entities/channel-message.entity";
import { SendBroadcastDto } from "./dto/send-broadcast.dto";

@Injectable()
export class OrbitChannelService {
  constructor(
    @InjectModel("OrbitChannel")
    private readonly orbitChannelModel: PaginateModel<IOrbitChannel>,
    @InjectModel("ChannelMember")
    private readonly channelMemberModel: PaginateModel<IChannelMember>,
    @InjectModel("ChannelMessage")
    private readonly channelMessageModel: PaginateModel<IChannelMessage>,
    private readonly orbitChannelGateway: OrbitChannelGateway,
    private readonly fileUploaderService: FileUploaderService
  ) {}
  async getChannelMessages(
    channelId: string,
    requestingUser: IUser,
    options: PaginateOptions
  ) {
    // 1. Authorization Check: Is the user a member of this channel?
    // This prevents non-members from reading messages.
    const membership = await this.channelMemberModel.findOne({
      channelId,
      userId: requestingUser._id,
    });

    if (!membership) {
      throw new ForbiddenException(
        "You must be a member of this channel to view messages."
      );
    }

    // 2. If the check passes, fetch the messages for the channel.
    const query = { channelId };

    // We add a sort option to get the newest messages first, which is standard for chat apps.
    const paginationWithOptions = {
      ...options,
      sort: { createdAt: -1 }, // Sort by creation date, descending
      lean: true, // Performance optimization
    };

    return await this.channelMessageModel.paginate(
      query,
      paginationWithOptions
    );
  }
  async sendBroadcastMessage(
    channelId: string,
    sender: IUser,
    dto: SendBroadcastDto,
    file?: Express.Multer.File, // Accept the optional file
  ): Promise<IChannelMessage> {
    // 1. Input Validation: Ensure the message is not empty.
    if (!dto.content && !file) {
      throw new BadRequestException('A message must have content or a media file.');
    }

    // 2. Authorization (This logic remains the same)
    const channel = await this.orbitChannelModel.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    if (channel.ownerId.toString() !== sender._id.toString()) {
      throw new ForbiddenException('Only the channel owner can send broadcast messages.');
    }

    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    // 3. File Handling: If a file was provided, upload it.
    if (file) {
      // Use the uploadChatMedia method from your existing service
      mediaUrl = await this.fileUploaderService.uploadChatMedia({
        mediaBuffer: file.buffer,
        myUser: sender,
        fileName: file.originalname,
      });

      // Determine the media type
      if (file.mimetype.startsWith('image')) {
        mediaType = 'image';
      } else if (file.mimetype.startsWith('video')) {
        mediaType = 'video';
      } else {
        mediaType = 'file';
      }
    }

    // 4. Save the message to the database with media info.
    const newMessage = new this.channelMessageModel({
      channelId,
      senderId: sender._id,
      content: dto.content, // This can be null if only media was sent
      mediaUrl,  // Will be the key/path from the uploader, or null
      mediaType, // Will be 'image', 'video', etc., or null
    });
    await newMessage.save();

    // 5. Broadcast via WebSocket (This logic remains the same)
    this.orbitChannelGateway.broadcastMessageToChannel(channelId, newMessage);

    return newMessage;
  }
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
    file: Express.Multer.File
  ): Promise<IOrbitChannel> {
    // Step A: Authorize the user (same logic as our updateChannel method)
    const channel = await this.orbitChannelModel.findById(channelId);
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }
    if (channel.ownerId.toString() !== requestingUser._id.toString()) {
      throw new ForbiddenException("You are not the owner of this channel.");
    }

    // Step B: Use your file uploader service to save the file
    // The `putImageCropped` method looks perfect for this. It returns the filename (key).
    const imageKey = await this.fileUploaderService.putImageCropped(
      file.buffer,
      requestingUser._id.toString()
    );

    // Step C: Update the channel document in the database with the new image key
    const updatedChannel = await this.orbitChannelModel.findByIdAndUpdate(
      channelId,
      { $set: { image: imageKey } },
      { new: true }
    );

    return updatedChannel;
  }
}
