/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
  Allow,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { MessageType } from "../../../core/utils/enums";
import CommonDto from "../../../core/common/dto/common.dto";
import { BaseUser } from "../../../core/utils/interfaceces";
import { IMessage } from "../../message/entities/message.entity";
import { jsonDecoder } from "../../../core/utils/app.validator";
import { Type } from "class-transformer";

class PollInputDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2) // A poll should have at least 2 options
  options: string[];
}

export class SendMessageDto extends CommonDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsUUID()
  localId: string;

  @IsEnum(MessageType)
  messageType: MessageType;

  @Allow()
  @ValidateIf((object) => object["isEncrypted"])
  @IsBooleanString()
  isEncrypted?: string;

  @Allow()
  @ValidateIf(attachmentValidation)
  @IsJSON()
  attachment?: string;

  @Allow()
  @ValidateIf((object) => object["linkAtt"])
  @IsJSON()
  linkAtt?: string;

  @Allow()
  @ValidateIf((object) => object["forwardLocalId"])
  @IsString()
  forwardLocalId?: string;

  @Allow()
  @ValidateIf((object) => object["replyToLocalId"])
  @IsUUID()
  replyToLocalId?: string;

  @Allow()
  @ValidateIf((object) => object.messageType === MessageType.Poll) // Only validate if it's a poll message
  @IsObject()
  @ValidateNested()
  @Type(() => PollInputDto)
  pollData?: PollInputDto;

  scheduledAt?: string;

  @Allow()
  @ValidateIf((object) => object["isOneSeen"] !== undefined)
  @IsBooleanString()
  isOneSeen?: string | boolean;
  _roomId: string;
  _mediaFile?: any;
  _secondMediaFile?: any;
  _replyTo?: string;
  _messageAttachment?: {};
  _platform: string;
  mentions: any[];
  _peerData?: BaseUser;
  //to broadcast only
  _id?: string;
  //to broadcast only
  _pBId?: string;
  // disappearingTimer?: number;
  disappearAt?: Date;

  toJson() {
    let pollDataForDb = null;
    if (this.messageType === MessageType.Poll && this.pollData) {
      pollDataForDb = {
        question: this.pollData.question,
        // Initialize options with empty votes arrays
        options: this.pollData.options.map((optionText) => ({
          text: optionText,
          votes: [],
        })),
      };
    }
    let x: Partial<IMessage> = {
      _id: this._id,
      sId: this.myUser._id,
      sName: this.myUser.fullName,
      sImg: this.myUser.userImage,
      plm: this._platform,
      rId: this._roomId,
      isOneSeen:
        typeof this.isOneSeen === "string"
          ? this.isOneSeen === "true"
          : this.isOneSeen,
      forId: this.forwardLocalId,
      linkAtt: this.linkAtt ? JSON.parse(this.linkAtt) : null,
      c: this.content,
      mT: this.messageType,
      mentions: this.mentions,
      isEncrypted: this.isEncrypted == "true",
      pBId: this._pBId,
      rTo: this._replyTo ? jsonDecoder(this._replyTo) : null,
      msgAtt: this._messageAttachment,
      lId: this.localId,
      peerData: this._peerData ? { ...this._peerData } : null,
      pollData: pollDataForDb,
      disappearAt: this.disappearAt,
    };
    return x;
  }

  isImage() {
    if (this.messageType == MessageType.Image) {
      return true;
    }
  }

  isVideo() {
    if (this.messageType == MessageType.Video) {
      return true;
    }
  }

  isVoice() {
    if (this.messageType == MessageType.Voice) {
      return true;
    }
  }

  isFile() {
    if (this.messageType == MessageType.File) {
      return true;
    }
  }

  isText() {
    if (this.messageType == MessageType.Text) {
      return true;
    }
  }

  isLocation() {
    if (this.messageType == MessageType.Location) {
      return true;
    }
  }

  isInfo() {
    if (this.messageType == MessageType.Info) {
      return true;
    }
  }

  isEncryptedMessage() {
    return this.isEncrypted;
  }

  isCustom() {
    if (this.messageType == MessageType.Custom) {
      return true;
    }
  }

  isRequireFile() {
    if (this.forwardLocalId) {
      return false;
    }
    return this.isImage() || this.isFile() || this.isVoice() || this.isVideo();
  }

  isRequireAttachment() {
    return this.isVideo() || this.isLocation() || this.isVoice();
  }
}

function attachmentValidation(object) {
  let mT = object["messageType"] as String;
  return (
    mT == MessageType.Video ||
    mT == MessageType.Location ||
    mT == MessageType.Custom ||
    mT == MessageType.Voice
  );
}
