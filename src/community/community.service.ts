import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICommunity } from "./entity/community.entity";
import {
  CreateCommunityDto,
  AddCommunityMemberDto,
  UpdateMemberStatusDto,
  AddGroupToCommunityDto,
  UpdateCommunityDto,
  MongoCommunityIdDto, // ADDED
} from "./dto/community.dto";
import { MongoRoomIdDto } from "src/core/common/dto/mongo.room.id.dto";
import {
  MessageInfoType,
  MessageType,
  RoomType,
  S3UploaderTypes,
} from "src/core/utils/enums";
import { getMsgDtoObj } from "src/chat/channel/chat.helper";
import { RoomMemberService } from "src/chat/room_member/room_member.service";
import { ChannelService } from "src/chat/channel/services/channel.service";
import { FileUploaderService } from "src/common/file_uploader/file_uploader.service";
import { RoomMiddlewareService } from "src/chat/room_middleware/room_middleware.service";
import { v4 as uuidv4 } from "uuid";
import { GroupSettingsService } from "src/chat/group_settings/group_settings.service";
import { MessageChannelService } from "src/chat/channel/services/message.channel.service";
@Injectable()
export class CommunityService {
  constructor(
    @InjectModel("Community")
    private readonly communityModel: Model<ICommunity>,
    private readonly s3: FileUploaderService,
    private readonly messageChannelService: MessageChannelService
  ) {}

  private isCommunityAdmin(community: ICommunity, userId: string): boolean {
    // Find a member who matches the userId, has the ADMIN role, and is ACTIVE.
    const admin = community.members.find(
      (m) =>
        // This handles cases where userId might be a populated object
        (m.userId as any)._id.toString() === userId &&
        m.role === "ADMIN" &&
        m.status === "ACTIVE"
    );

    // The !! converts the result (either the found admin object or undefined) to a boolean.
    return !!admin;
  }

  async updateImage(dto: MongoCommunityIdDto, file: any): Promise<string> {
    const community = await this.communityModel.findById(dto.communityId);
    if (!community) {
      throw new NotFoundException(
        `Community with ID ${dto.communityId} not found.`
      );
    }
    
    const member = community.members.find(
      (m) => m.userId.toString() === dto.myUser._id.toString()
    );

    if (!member || member.role !== "ADMIN") {
      throw new ForbiddenException(
        "You do not have permission to update this community image."
      );
    }

    // Step 2: Image Upload - Generate a unique key and upload the cropped image to S3.
    // It's good practice to have a separate S3 type for community images.
    const keyImage = `${S3UploaderTypes.communityImage}-${uuidv4()}.jpg`;
    const url = await this.s3.putImageCropped(file.buffer, keyImage);

    // Step 3: Update the Database - Set the new image URL on the community document.
    community.cImg = url;
    await community.save();
    return url;
  }
  // Step 4: Send Real-time Notifications - Inform all associated groups of the change.
    // if (community.groups && community.groups.length > 0) {
    //   for (const groupId of community.groups) {
    //     const msgDto = getMsgDtoObj({
    //       mT: MessageType.Info,
    //       user: dto.myUser,
    //       rId: groupId.toString(),
    //       att: {
    //         adminName: dto.myUser.fullName,
    //         targetName: url,
    //         action: MessageInfoType.UpdateCommunityImage,
    //       },
    //       content: `Community photo updated by ${dto.myUser.fullName}`,
    //     });

    //     this.messageChannelService.createMessage(msgDto, true).catch((err) => {
    //       console.error(
    //         `Failed to send community update notification to group ${groupId}:`,
    //         err
    //       );
    //     });
    //   }
    // }

  async getAllCommunities(): Promise<ICommunity[]> {
    return this.communityModel.find().populate("groups").exec();
  }

  async getMyCommunities(userId: string): Promise<ICommunity[]> {
    return this.communityModel
      .find({ "members.userId": userId, "members.status": "ACTIVE" })
      .populate("groups")
      .exec();
  }

  async createCommunity(
    adminId: string,
    dto: CreateCommunityDto
  ): Promise<ICommunity> {
    const community = new this.communityModel({
      ...dto,
      cId: adminId,
      members: [{ userId: adminId, role: "ADMIN", status: "ACTIVE" }],
    });
    return community.save();
  }

  async getCommunity(id: string, requesterId: string): Promise<any> {
    const community = await this.communityModel
      .findById(id)
      .populate("groups")
      .populate({ path: "members.userId", select: "name username" }); // Populate member details for admins

    if (!community) throw new NotFoundException("Community not found");

    const isRequesterAdmin = await this.isCommunityAdmin(
      community,
      requesterId
    );

    if (isRequesterAdmin) {
      return community;
    }

    const isMember = community.members.some(
      (m) =>
        (m.userId as any)._id.toString() === requesterId &&
        m.status === "ACTIVE"
    );

    if (!isMember) {
      throw new ForbiddenException("You are not a member of this community.");
    }

    // For non-admin members, hide the members list as per requirements.
    const communityObject = community.toObject();
    // delete communityObject.members; // Remove sensitive member list
    return {
      ...communityObject,
      memberCount: community.members.length, // Provide a non-sensitive member count instead
    };
  }

  // ADDED: New method for admins to update community settings.
  async updateCommunity(
    communityId: string,
    adminId: string,
    dto: UpdateCommunityDto
  ): Promise<ICommunity> {
    const community = await this.communityModel.findById(communityId);
    if (!community) throw new NotFoundException("Community not found");

    if (!(await this.isCommunityAdmin(community, adminId))) {
      throw new ForbiddenException(
        "Only admins can update community settings."
      );
    }

    Object.assign(community, dto);
    return community.save();
  }

  // CHANGED: Added admin check and limit validation.
  async addMember(
    communityId: string,
    adminId: string,
    dto: AddCommunityMemberDto
  ): Promise<ICommunity> {
    const community = await this.communityModel.findById(communityId);
    if (!community) throw new NotFoundException("Community not found");

    if (!(await this.isCommunityAdmin(community, adminId))) {
      throw new ForbiddenException("Only admins can add new members.");
    }

    if (
      community.maxMembers &&
      community.members.length >= community.maxMembers
    ) {
      throw new ForbiddenException("Community has reached its member limit.");
    }

    const alreadyMember = community.members.find(
      (m) => m.userId.toString() === dto.userId
    );
    if (alreadyMember) {
      throw new BadRequestException(
        "User is already a member of this community."
      );
    }

    community.members.push({
      userId: dto.userId,
      role: dto.role,
      status: "ACTIVE", // community.joinApprovalRequired ? "PENDING" :
    });

    return community.save();
  }

  async joinCommunity(
    communityId: string,
    userId: string
  ): Promise<ICommunity> {
    const community = await this.communityModel.findById(communityId);
    if (!community) throw new NotFoundException("Community not found");
    if (
      community.maxMembers &&
      community.members.length >= community.maxMembers
    ) {
      throw new ForbiddenException("Community has reached its member limit.");
    }

    const alreadyMember = community.members.find(
      (m) => m.userId.toString() === userId
    );
    if (alreadyMember) {
      throw new BadRequestException(
        "User is already a member of this community."
      );
    }

    community.members.push({
      userId: userId,
      role: "MEMBER",
      status: community.joinApprovalRequired ? "PENDING" : "ACTIVE",
    });

    return community.save();
  }

  // CHANGED: Added admin authorization check.
  async updateMemberStatus(
    communityId: string,
    adminId: string,
    userId: string,
    dto: UpdateMemberStatusDto
  ): Promise<ICommunity> {
    const community = await this.communityModel.findById(communityId);
    if (!community) throw new NotFoundException("Community not found");

    if (!(await this.isCommunityAdmin(community, adminId))) {
      throw new ForbiddenException("Only admins can update member status.");
    }

    const member = community.members.find(
      (m) => m.userId.toString() === userId
    );
    if (!member) throw new NotFoundException("Member not found in community");

    member.status = dto.status;

    return community.save();
  }

  // CHANGED: Added admin authorization check and safeguard for last admin.
  async removeMember(
    communityId: string,
    adminId: string,
    userId: string
  ): Promise<ICommunity> {
    const community = await this.communityModel.findById(communityId);
    if (!community) throw new NotFoundException("Community not found");

    if (!(await this.isCommunityAdmin(community, adminId))) {
      throw new ForbiddenException("Only admins can remove members.");
    }

    // CHANGED: Safeguard to prevent removing the last admin.
    const memberToRemove = community.members.find(
      (m) => m.userId.toString() === userId
    );
    if (memberToRemove && memberToRemove.role === "ADMIN") {
      const adminCount = community.members.filter(
        (m) => m.role === "ADMIN"
      ).length;
      if (adminCount <= 1) {
        throw new ForbiddenException(
          "Cannot remove the last admin from the community."
        );
      }
    }

    community.members = community.members.filter(
      (m) => m.userId.toString() !== userId
    );

    return community.save();
  }

  // CHANGED: Added admin authorization check.
  async addGroup(
    communityId: string,
    adminId: string,
    dto: AddGroupToCommunityDto
  ): Promise<ICommunity> {
    const community = await this.communityModel.findById(communityId);
    if (!community) throw new NotFoundException("Community not found");

    if (!(await this.isCommunityAdmin(community, adminId))) {
      throw new ForbiddenException("Only admins can add groups.");
    }

    if (!community.groups.includes(dto.groupId as any)) {
      community.groups.push(dto.groupId as any);
    }

    return community.save();
  }
}
