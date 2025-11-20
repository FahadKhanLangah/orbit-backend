/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { VerifiedAuthGuard } from "../../core/guards/verified.auth.guard";
import { V1Controller } from "../../core/common/v1-controller.decorator";
import { resOK } from "../../core/utils/res.helpers";
import { MongoIdDto } from "../../core/common/dto/mongo.id.dto";
import { LiveStreamService } from "./live_stream.service";
import {
  CreateLiveStreamDto,
  JoinLiveStreamDto,
  SendLiveStreamMessageDto,
  UpdateLiveStreamDto,
  LiveStreamFilterDto,
  RemoveParticipantDto,
  BanParticipantDto,
  RequestJoinStreamDto,
  RespondToJoinRequestDto,
  UpdateStreamFilterDto,
} from "./dto/live_stream.dto";
import { CategoryService } from "../admin_panel/category/category.service";
import { SendGiftDto } from "./dto/send_gift.dto";
import { log } from "console";
import { InviteCoHostDto } from "./dto/invite-cohost.dto";

@UseGuards(VerifiedAuthGuard)
@V1Controller("live-stream")
export class LiveStreamController {
  constructor(
    private readonly liveStreamService: LiveStreamService,
    private readonly categoryService: CategoryService
  ) { }

  @Post("/:streamId/invite-cohost")
  async inviteCoHost(
    @Param("streamId") streamId: string,
    @Req() req: any,
    @Body() dto: InviteCoHostDto
  ) {
    const { _id: hostUserId } = req.user;
    await this.liveStreamService.inviteCoHost(
      streamId,
      hostUserId,
      dto.guestUserId
    );
    return { message: "Invitation sent successfully." };
  }

  @Post("/:streamId/accept-cohost")
  async acceptCoHostInvitation(
    @Param("streamId") streamId: string,
    @Req() req: any
  ) {
    const { _id: acceptorId } = req.user;
    await this.liveStreamService.acceptCoHostInvitation(streamId, acceptorId);
    return { message: "Invitation accepted. You are now a co-host." };
  }

  @Post(":id/gift")
  async sendGift(
    @Param() params: MongoIdDto,
    @Req() req: any,
    @Body() sendGiftDto: SendGiftDto
  ) {
    const { id: streamId } = params;
    const { _id: senderId } = req.user;
    const { giftId } = sendGiftDto;

    const result = await this.liveStreamService.sendGift(
      streamId,
      senderId,
      giftId
    );

    return resOK(result);
  }

  @Get("/categories")
  async findAll() {
    const categories = await this.categoryService.findAll();
    return resOK(categories);
  }

  @Get("/recorded/:id")
  async getSavedStreamById(@Param("id") id: string) {
    const result = await this.liveStreamService.getSavedStreamById(id);
    return resOK(result);
  }

  @Get("/recorded/saved/streams")
  async getSavedStreams(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("category") categoryName?: string,
    @Query("sort") sortBy?: string
  ) {
    const result = await this.liveStreamService.getSavedStreams({
      page,
      limit,
      categoryName,
      sortBy,
    });
    return resOK(result);
  }

  @Post(":id/upload-recording")
  @UseInterceptors(FileInterceptor("video"))
  async uploadLiveStreamRecording(
    @Param() params: MongoIdDto,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException("Video file is required.");
    }

    const updatedStream = await this.liveStreamService.saveLiveStreamRecording(
      params.id,
      req.user,
      file
    );
    return resOK(updatedStream);
  }

  @Post()
  @UseInterceptors(FileInterceptor("thumbnail"))
  async createLiveStream(
    @Body() dto: CreateLiveStreamDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    dto.myUser = req.user;

    // if (file) {
    // You can implement S3 upload here similar to other parts of your app
    // dto.thumbnailUrl = await this.s3Service.uploadFile(file);
    // }

    const stream = await this.liveStreamService.createLiveStream(dto);
    return resOK(stream);
  }

  @Post(":id/start")
  async startLiveStream(@Param() params: MongoIdDto, @Req() req: any) {
    const stream = await this.liveStreamService.startLiveStream(
      params.id,
      req.user._id
    );
    return resOK(stream);
  }

  @Post(":id/end")
  async endLiveStream(@Param() params: MongoIdDto, @Req() req: any) {
    const stream = await this.liveStreamService.endLiveStream(
      params.id,
      req.user._id
    );
    return resOK(stream);
  }

  @Post(":id/join")
  async joinLiveStream(@Param() params: MongoIdDto, @Req() req: any) {
    const dto: JoinLiveStreamDto = {
      streamId: params.id,
      myUser: req.user,
    };
    const result = await this.liveStreamService.joinLiveStream(dto);
    return resOK(result);
  }

  @Post(":id/leave")
  async leaveLiveStream(@Param() params: MongoIdDto, @Req() req: any) {
    await this.liveStreamService.leaveLiveStream(params.id, req.user._id);
    return resOK({ message: "Left stream successfully" });
  }

  @Post(":id/message")
  async sendMessage(
    @Param() params: MongoIdDto,
    @Body() dto: SendLiveStreamMessageDto,
    @Req() req: any
  ) {
    dto.myUser = req.user;
    const message = await this.liveStreamService.sendMessage(params.id, dto);
    return resOK(message);
  }

  @Post(":id/filter")
  async updateStreamFilter(
    @Param() params: MongoIdDto,
    @Body() dto: UpdateStreamFilterDto,
    @Req() req: any
  ) {
    dto.myUser = req.user;
    const result = await this.liveStreamService.updateStreamFilter(
      params.id,
      dto
    );
    return resOK(result);
  }

  @Get()
  async getLiveStreams(@Query() filter: LiveStreamFilterDto, @Req() req: any) {
    const result = await this.liveStreamService.getLiveStreams(
      filter,
      req.user._id
    );
    return resOK(result);
  }

  @Get(":id")
  async getStreamById(@Param() params: MongoIdDto) {
    const stream = await this.liveStreamService.getStreamById(params.id);
    return resOK(stream);
  }

  @Get(":id/messages")
  async getStreamMessages(
    @Param() params: MongoIdDto,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 50
  ) {
    const messages = await this.liveStreamService.getStreamMessages(
      params.id,
      page,
      limit
    );
    return resOK(messages);
  }

  @Get(":id/participants")
  async getStreamParticipants(@Param() params: MongoIdDto) {
    const participants = await this.liveStreamService.getStreamParticipants(
      params.id
    );
    return resOK(participants);
  }

  @Post(":streamId/message/:messageId/pin")
  async pinMessage(
    @Param("streamId") streamId: string,
    @Param("messageId") messageId: string,
    @Req() req: any
  ) {
    const result = await this.liveStreamService.pinMessage(
      streamId,
      messageId,
      req.user._id
    );
    return resOK(result);
  }

  @Delete(":streamId/message/:messageId/pin")
  async unpinMessage(
    @Param("streamId") streamId: string,
    @Param("messageId") messageId: string,
    @Req() req: any
  ) {
    const result = await this.liveStreamService.unpinMessage(
      streamId,
      messageId,
      req.user._id
    );
    return resOK(result);
  }

  @Get(":id/pinned-message")
  async getPinnedMessage(@Param() params: MongoIdDto) {
    const message = await this.liveStreamService.getPinnedMessage(params.id);
    return resOK(message);
  }

  @Put(":id")
  async updateLiveStream(
    @Param() params: MongoIdDto,
    @Body() dto: UpdateLiveStreamDto,
    @Req() req: any
  ) {
    dto.myUser = req.user;
    // Implementation for updating stream details
    return resOK({ message: "Stream updated successfully" });
  }

  @Delete(":id")
  async deleteLiveStream(@Param('id') params: MongoIdDto, @Req() req: any) {
    const userId = req.user._id;
    return await this.liveStreamService.deleteSavedStream(params.id, userId)
  }

  @Post(":id/remove-participant")
  async removeParticipant(
    @Param() params: MongoIdDto,
    @Body() dto: RemoveParticipantDto,
    @Req() req: any
  ) {
    dto.myUser = req.user;
    const result = await this.liveStreamService.removeParticipant(
      params.id,
      dto
    );
    return resOK(result);
  }

  @Post(":id/ban-participant")
  async banParticipant(
    @Param() params: MongoIdDto,
    @Body() dto: BanParticipantDto,
    @Req() req: any
  ) {
    dto.myUser = req.user;
    const result = await this.liveStreamService.banParticipant(params.id, dto);
    return resOK(result);
  }

  @Post(":id/like")
  async likeStream(@Param() params: MongoIdDto, @Req() req: any) {
    const result = await this.liveStreamService.likeStream(
      params.id,
      req.user._id
    );
    return resOK(result);
  }

  @Get(":id/likes")
  async getStreamLikes(@Param() params: MongoIdDto) {
    const result = await this.liveStreamService.getStreamLikes(params.id);
    return resOK(result);
  }

  @Post(":id/request-join")
  async requestJoinStream(@Param() params: MongoIdDto, @Req() req: any) {
    const dto: RequestJoinStreamDto = {
      streamId: params.id,
      myUser: req.user,
    };
    const result = await this.liveStreamService.requestJoinStream(dto);
    return resOK(result);
  }

  @Post("join-request/:requestId/respond")
  async respondToJoinRequest(
    @Param("requestId") requestId: string,
    @Body() body: { action: "approve" | "deny" },
    @Req() req: any
  ) {
    const dto: RespondToJoinRequestDto = {
      requestId: requestId,
      action: body.action,
      myUser: req.user,
    };
    const result = await this.liveStreamService.respondToJoinRequest(dto);
    return resOK(result);
  }

  @Get(":id/join-requests")
  async getJoinRequests(@Param() params: MongoIdDto, @Req() req: any) {
    const result = await this.liveStreamService.getJoinRequests(
      params.id,
      req.user._id
    );
    return resOK(result);
  }
}
