// src/orbit-channel/orbit-channel.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Param,
  Patch,
  UseInterceptors,
  UploadedFile,
  Delete,
} from "@nestjs/common";
import { OrbitChannelService } from "./orbit-channel.service";
import { VerifiedAuthGuard } from "../core/guards/verified.auth.guard"; // Adjust path
import {
  CreateOrbitChannelDto,
  UpdateOrbitChannelDto,
} from "./dto/orbit.channel.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { SendBroadcastDto } from "./dto/send-broadcast.dto";

@Controller("orbit-channel")
@UseGuards(VerifiedAuthGuard)
export class OrbitChannelController {
  constructor(private readonly orbitChannelService: OrbitChannelService) {}
  @Get(":channelId/messages")
  async getMessages(
    @Param("channelId") channelId: string,
    @Req() req: any,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20
  ) {
    const user = req.user;
    const options = { page, limit };
    return this.orbitChannelService.getChannelMessages(
      channelId,
      user,
      options
    );
  }

  @Post(":channelId/broadcast")
  @UseInterceptors(FileInterceptor("media"))
  async sendBroadcast(
    @Param("channelId") channelId: string,
    @Req() req: any,
    @Body() dto: SendBroadcastDto,
    @UploadedFile() file?: Express.Multer.File // 4. Inject the optional file
  ) {
    const user = req.user;
    return this.orbitChannelService.sendBroadcastMessage(
      channelId,
      user,
      dto,
      file
    );
  }
  @Get("my-channels")
  async getMyChannels(
    @Req() req: any,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    const user = req.user;
    return this.orbitChannelService.getMyChannels(user, { page, limit });
  }

  @Post()
  async create(@Body() createDto: CreateOrbitChannelDto, @Req() req: any) {
    const user = req.user;
    return this.orbitChannelService.createChannel(createDto, user);
  }
  @Get()
  async get(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    return this.orbitChannelService.getChannels({ page, limit });
  }
  @Post(":channelId/join")
  async join(@Param("channelId") channelId: string, @Req() req: any) {
    const user = req.user;
    return this.orbitChannelService.joinChannel(channelId, user);
  }

  @Delete(":channelId/left-channel")
  async leftChannel(@Param("channelId") channelId: string, @Req() req: any) {
    const userId = req.user._id;
    return this.orbitChannelService.leaveChannel(channelId,userId);
  }

  @Get(":channelId")
  async getOnePublicChannel(@Param("channelId") channelId: string) {
    return this.orbitChannelService.getPublicChannelDetails(channelId);
  }
  @Get(":channelId/members")
  async getMembers(
    @Param("channelId") channelId: string,
    @Req() req: any,
    // Add pagination query parameters
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    const user = req.user;
    const options = { page, limit };
    return this.orbitChannelService.getChannelMembersForOwner(
      channelId,
      user,
      options
    );
  }

  @Patch(":channelId")
  async update(
    @Param("channelId") channelId: string,
    @Body() updateDto: UpdateOrbitChannelDto,
    @Req() req: any
  ) {
    const user = req.user;
    return this.orbitChannelService.updateChannel(channelId, updateDto, user);
  }
  @Patch(":channelId/image")
  @UseInterceptors(FileInterceptor("image"))
  async updateChannelImage(
    @Param("channelId") channelId: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    const user = req.user;
    return this.orbitChannelService.updateChannelImage(channelId, user, file);
  }
  @Delete(":channelId")
  async deleteChannel(@Param("channelId") channelId: string, @Req() req: any) {
    const user = req.user._id;
    return this.orbitChannelService.deleteChannel(channelId, user);
  }
}
