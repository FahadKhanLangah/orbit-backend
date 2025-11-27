/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import CommonDto from "../../../core/common/dto/common.dto";
import { ChatRequestStatus, UserPrivacyTypes } from "../../../core/utils/enums";
import { DpVisibilityType, WhoCanType } from "src/api/user_modules/user/entities/user.entity";
import { Type } from "class-transformer";


export class UpdateMyNameDto extends CommonDto {
    @IsNotEmpty()
    fullName: string
}

export class UpdateMyPrivacyDto extends CommonDto {
    @IsOptional()
    @IsEnum(UserPrivacyTypes)
    startChat: UserPrivacyTypes

    @IsOptional()
    @IsBoolean()
    publicSearch: boolean

    @IsOptional()
    @IsBoolean()
    lastSeen: boolean

    @IsOptional()
    @IsEnum(UserPrivacyTypes)
    showStory: UserPrivacyTypes

    @IsOptional()
    @IsBoolean()
    readReceipts: boolean

    @IsOptional()
    @IsEnum(WhoCanType)
    whoCanAddMeToGroups: WhoCanType;

    @IsOptional()
    @IsEnum(WhoCanType)
    whoCanCallMe: WhoCanType;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    callDeniedList: string[];

    @IsOptional()
    @IsEnum(DpVisibilityType)
    dpVisibility: DpVisibilityType;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    dpDeniedList: string[];
}

export class UpdateChatReqStatusDto extends CommonDto {
    @IsEnum(ChatRequestStatus)
    status: ChatRequestStatus
}

export class UpdateMyBioDto extends CommonDto {
    @IsNotEmpty()
    bio: string
}

export class UpdateMyPhoneNumberDto extends CommonDto {
    @IsNotEmpty()
    phoneNumber: string
}

export class UpdateMyPasswordDto extends CommonDto {
    @IsNotEmpty()
    oldPassword: string
    @IsNotEmpty()
    newPassword: string

    @IsNotEmpty()
    newConfPassword: string

    @IsBoolean()
    logoutAll: boolean
}