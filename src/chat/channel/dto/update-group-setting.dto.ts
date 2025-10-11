import { IsArray, IsEnum, IsMongoId, IsOptional } from "class-validator";
import { GroupMessagingPolicy } from "src/chat/group_settings/entities/group_setting.entity";
import CommonDto from "src/core/common/dto/common.dto";

export class UpdateGroupSettingsDto extends CommonDto {
    @IsOptional()
    @IsEnum(GroupMessagingPolicy)
    messagingPolicy: GroupMessagingPolicy;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    mutedMembers: string[];
}