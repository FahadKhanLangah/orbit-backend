import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { CommunityService } from "./community.service";
import {
  CreateCommunityDto,
  AddCommunityMemberDto,
  UpdateMemberStatusDto,
  AddGroupToCommunityDto,
  UpdateCommunityDto,
  MongoCommunityIdDto, // ADDED
} from "./dto/community.dto";
import { VerifiedAuthGuard } from "src/core/guards/verified.auth.guard";
import { MongoRoomIdDto } from "src/core/common/dto/mongo.room.id.dto";
import { resOK } from "src/core/utils/res.helpers";
import { imageFileInterceptor } from "src/core/utils/upload_interceptors";

@UseGuards(VerifiedAuthGuard)
@Controller("communities")
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseInterceptors(imageFileInterceptor)
  @Patch("/:communityId/image")
  async updateCommunityImage(
    @Req() req: any,
    @Param() dto: MongoCommunityIdDto,
    @UploadedFile() file?: any
  ) {
    if (!file) {
      throw new BadRequestException("Image file is required");
    }
    dto.myUser = req.user;
    return resOK(await this.communityService.updateImage(dto, file));
  }

  @Get()
  getAll() {
    return this.communityService.getAllCommunities();
  }

  @Get("my")
  getMy(@Req() req: any) {
    const userId = req.user._id;
    return this.communityService.getMyCommunities(userId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateCommunityDto) {
    const adminId = req.user._id;
    return this.communityService.createCommunity(adminId, dto);
  }

  // CHANGED: Pass requester's ID to the service for privacy checks.
  @Get(":id")
  get(@Param("id") id: string, @Req() req: any) {
    const requesterId = req.user._id;
    return this.communityService.getCommunity(id, requesterId);
  }

  // ADDED: New endpoint for updating community details.
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: UpdateCommunityDto
  ) {
    const adminId = req.user._id;
    return this.communityService.updateCommunity(id, adminId, dto);
  }

  // CHANGED: Pass admin's ID for authorization check.
  @Post(":id/members")
  addMember(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: AddCommunityMemberDto
  ) {
    const adminId = req.user._id;
    return this.communityService.addMember(id, adminId, dto);
  }
  @Post(":id/join")
  joinMember(@Param("id") id: string, @Req() req: any) {
    const userId = req.user._id;
    return this.communityService.joinCommunity(id, userId);
  }

  @Patch(":id/members/:userId/status")
  updateStatus(
    @Param("id") id: string,
    @Param("userId") userId: string,
    @Req() req: any,
    @Body() dto: UpdateMemberStatusDto
  ) {
    const adminId = req.user._id;
    return this.communityService.updateMemberStatus(id, adminId, userId, dto);
  }

  // CHANGED: Pass admin's ID for authorization check.
  @Delete(":id/members/:userId")
  removeMember(
    @Param("id") id: string,
    @Param("userId") userId: string,
    @Req() req: any
  ) {
    const adminId = req.user._id;
    return this.communityService.removeMember(id, adminId, userId);
  }

  // CHANGED: Pass admin's ID for authorization check.
  @Post(":id/groups")
  addGroup(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: AddGroupToCommunityDto
  ) {
    const adminId = req.user._id;
    return this.communityService.addGroup(id, adminId, dto);
  }
}
