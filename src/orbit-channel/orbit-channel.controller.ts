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
} from "@nestjs/common";
import { OrbitChannelService } from "./orbit-channel.service";
import { VerifiedAuthGuard } from "../core/guards/verified.auth.guard"; // Adjust path
import {
  CreateOrbitChannelDto,
  UpdateOrbitChannelDto,
} from "./dto/orbit.channel.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("orbit-channel")
@UseGuards(VerifiedAuthGuard)
export class OrbitChannelController {
  constructor(private readonly orbitChannelService: OrbitChannelService) {}
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
   // 2. Add the new endpoint for image upload
  @Patch(':channelId/image')
  @UseInterceptors(FileInterceptor('image')) // 3. This is the magic!
  async updateChannelImage(
    @Param('channelId') channelId: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File, // 4. Inject the uploaded file
  ) {
    const user = req.user;
    return this.orbitChannelService.updateChannelImage(channelId, user, file);
  }
}
