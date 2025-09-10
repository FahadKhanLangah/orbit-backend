import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  IsMongoId,
} from "class-validator";
import CommonDto from "src/core/common/dto/common.dto";

export class CreateCommunityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  cImg?: string;

  // ADDED: Allow setting max members on creation.
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMembers?: number;

  // ADDED: Allow setting join approval on creation.
  @IsOptional()
  @IsBoolean()
  joinApprovalRequired?: boolean;
}

// ADDED: New DTO for updating community settings.
export class UpdateCommunityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  cImg?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMembers?: number;

  @IsOptional()
  @IsBoolean()
  joinApprovalRequired?: boolean;
}

export class AddCommunityMemberDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(["ADMIN", "MEMBER"])
  role: "ADMIN" | "MEMBER" = "MEMBER";
}

export class UpdateMemberStatusDto {
  @IsNotEmpty()
  @IsEnum(["ACTIVE", "PENDING", "REMOVED"])
  status: "ACTIVE" | "PENDING" | "REMOVED";
}

export class AddGroupToCommunityDto {
  @IsNotEmpty()
  @IsString()
  groupId: string;
}

export class MongoCommunityIdDto extends CommonDto {
  @IsMongoId()
  communityId: string;
}
