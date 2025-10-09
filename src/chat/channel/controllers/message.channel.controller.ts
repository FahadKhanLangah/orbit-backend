/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { MessageChannelService } from "../services/message.channel.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { SendMessageDto } from "../dto/send.message.dto";
import { DeleteMessageDto } from "../dto/delete.message.dto";
import { NotificationReplyDto } from "../dto/notification.reply.dto";
import { VerifiedAuthGuard } from "../../../core/guards/verified.auth.guard";
import { V1Controller } from "../../../core/common/v1-controller.decorator";
import { MongoRoomIdDto } from "../../../core/common/dto/mongo.room.id.dto";
import { resOK } from "../../../core/utils/res.helpers";
import { MessagesSearchDto } from "../../message/dto/messages_search_dto";
import { RoomIdAndMsgIdDto } from "../../../core/common/dto/room.id.and.msg.id.dto";
import { VoteOnPollDto } from "src/chat/message/dto/VoteOnPollDto";
import { MongoIdDto } from "src/core/common/dto/mongo.id.dto";
import { MongoMessageIdDto } from "src/core/common/dto/mongo.messageId.dto";

@UseGuards(VerifiedAuthGuard)
@V1Controller("channel/:roomId/message") 
export class MessageChannelController {
  constructor(private readonly channelMessageService: MessageChannelService) {}

  @UseInterceptors(
    FilesInterceptor("file", 2, {
      limits: {
        files: 4,
        fields: 400,
        fieldSize: 400000000000,
        fieldNameSize: 400000000000,
      },
    })
  )

  @Post("/")
  async createMessage(
    @Req() req: any,
    @Param() roomDtoId: MongoRoomIdDto,
    @Body() dto: SendMessageDto,
    @UploadedFiles() file?: any[]
  ) {
    dto.myUser = req.user;
    if (dto.isRequireFile()) {
      dto._mediaFile = file[0];
      dto._secondMediaFile = file[1] ?? undefined;
      if (!dto._mediaFile)
        throw new BadRequestException(
          "Msg type " +
            dto.messageType +
            " required file in multipart or file bigger than the limit!"
        );
    }
    dto._roomId = roomDtoId.roomId;
    dto._platform = dto.myUser.currentDevice.platform;
    if (dto.scheduledAt) {
      const scheduledDate = new Date(dto.scheduledAt);

      return resOK(
        await this.channelMessageService.scheduleMessage(dto, scheduledDate)
      );
    }
    return resOK(await this.channelMessageService.createMessage(dto));
  }

  @Post("/:messageId/vote")
  async voteOnPoll(
    @Req() req: any,
    @Param() params: MongoMessageIdDto,
    @Body() dto: VoteOnPollDto
  ) {
    const updatedMessage = await this.channelMessageService.voteNow(
      req.user._id,
      params.messageId,
      dto.optionText
    );
    return resOK(updatedMessage);
  }

  @Delete("/:messageId/delete/:type")
  async deleteRoomMessage(@Req() req: any, @Param() dto: DeleteMessageDto) {
    dto.myUser = req.user;
    return resOK(await this.channelMessageService.deleteRoomMessage(dto));
  }

  @Post("/:messageId/star")
  async starRoomMessage(@Req() req: any, @Param() dto: RoomIdAndMsgIdDto) {
    dto.myUser = req.user;
    return resOK(await this.channelMessageService.starRoomMessage(dto));
  }

  @Post("/:messageId/un-star")
  async unStarRoomMessage(@Req() req: any, @Param() dto: RoomIdAndMsgIdDto) {
    dto.myUser = req.user;
    return resOK(await this.channelMessageService.unStarRoomMessage(dto));
  }

  @Get("/stars")
  async getMyAllStarMessages(@Req() req: any, @Param() dto: MongoRoomIdDto) {
    dto.myUser = req.user;
    return resOK(await this.channelMessageService.getMyAllStarMessages(dto));
  }

  @Get("/")
  async getRoomMessages(
    @Req() req: any,
    @Param() paramDto: MongoRoomIdDto,
    @Query() dto: MessagesSearchDto
  ) {
    return resOK(
      await this.channelMessageService.getRoomMessages(
        req.user._id,
        paramDto.roomId,
        dto
      )
    );
  }

  @Patch("/:messageId/one-seen")
  async oneSeeThisMessage(@Req() req: any, @Param() dto: RoomIdAndMsgIdDto) {
    dto.myUser = req.user;
    return resOK(await this.channelMessageService.oneSeeThisMessage(dto));
  }

  @Patch("/:messageId/edit")
  async editMessage(
    @Req() req: any,
    @Param() dto: RoomIdAndMsgIdDto,
    @Body("content") content: string
  ) {
    dto.myUser = req.user;
    if (!content || content.trim().length === 0) {
      throw new BadRequestException("Content is required");
    }
    return resOK(
      await this.channelMessageService.editMessage(dto, content.trim())
    );
  }

  @Post("/:messageId/react")
  async reactToMessage(
    @Req() req: any,
    @Param() dto: RoomIdAndMsgIdDto,
    @Body("emoji") emoji: string
  ) {
    dto.myUser = req.user;
    if (!emoji || emoji.trim().length === 0) {
      throw new BadRequestException("Emoji is required");
    }
    return resOK(
      await this.channelMessageService.reactToMessage(dto, emoji.trim())
    );
  }

  @Post("/notification-reply")
  async replyFromNotification(
    @Req() req: any,
    @Body() dto: NotificationReplyDto
  ) {
    dto.myUser = req.user;
    return resOK(await this.channelMessageService.replyFromNotification(dto));
  }
}
