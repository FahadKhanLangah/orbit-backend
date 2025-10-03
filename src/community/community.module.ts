import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CommunityController } from "./community.controller";
import { CommunityService } from "./community.service";
import { CommunitySchema } from "./entity/community.entity";
import { AuthModule } from "src/api/auth/auth.module";
import { GroupSettingSchema } from "src/chat/group_settings/entities/group_setting.entity";
import { UserSchema } from "src/api/user_modules/user/entities/user.entity";
import { MessageModule } from "src/chat/message/message.module";
import { FileUploaderModule } from "src/common/file_uploader/file_uploader.module";
import { ChannelModule } from "src/chat/channel/channel.module";
import { MessageChannelService } from "src/chat/channel/services/message.channel.service";
import { RoomMemberModule } from "src/chat/room_member/room_member.module";
import { ChannelService } from "src/chat/channel/services/channel.service";
import { UserModule } from "src/api/user_modules/user/user.module";
import { SocketIoModule } from "src/chat/socket_io/socket_io.module";
import { NotificationEmitterModule } from "src/common/notification_emitter/notification_emitter.module";
import { SingleRoomSettingsModule } from "src/chat/single_room_settings/single_room_settings.module";
import { GroupSettingsModule } from "src/chat/group_settings/group_settings.module";
import { BroadcastSettingsModule } from "src/chat/broadcast_settings/broadcast_settings.module";
import { GroupMemberModule } from "src/chat/group_member/group_member.module";
import { BroadcastMemberModule } from "src/chat/broadcast_member/broadcast_member.module";
import { RoomMiddlewareModule } from "src/chat/room_middleware/room_middleware.module";
import { AppConfigModule } from "src/api/app_config/app_config.module";
import { GroupMessageStatusModule } from "src/chat/group_message_status/group_message_status.module";
import { UserBanModule } from "src/api/user_modules/user_ban/user_ban.module";
import { OrderRoomSettingsModule } from "src/chat/order_room_settings/order_room_settings.module";
import { UserDeviceModule } from "src/api/user_modules/user_device/user_device.module";
import { LoyaltyPointsModule } from "src/api/user_modules/loyalty_points/loyalty_points.module";
import { GroupChannelService } from "src/chat/channel/services/group.channel.service";
import { BroadcastChannelService } from "src/chat/channel/services/broadcast.channel.service";
import { NotificationEmitterChannelService } from "src/chat/channel/services/notification_emitter_channel.service";
import { ChannelController } from "src/chat/channel/controllers/channel.controller";
import { BroadcastChannelController } from "src/chat/channel/controllers/broadcast.channel.controller";
import { MessageChannelController } from "src/chat/channel/controllers/message.channel.controller";
import { GroupChannelController } from "src/chat/channel/controllers/group.channel.controller";
import { RoomMemberSchema } from "src/chat/room_member/entities/room_member.entity";

@Module({
  imports: [
    UserModule,
    MessageModule,
    RoomMemberModule,
    SocketIoModule,
    FileUploaderModule,
    AuthModule,
    NotificationEmitterModule,
    SingleRoomSettingsModule,
    GroupSettingsModule,
    BroadcastSettingsModule,
    GroupMemberModule,
    BroadcastMemberModule,
    RoomMiddlewareModule,
    AppConfigModule,
    GroupMessageStatusModule,
    UserBanModule,
    OrderRoomSettingsModule,
    UserDeviceModule,
    LoyaltyPointsModule,
    ChannelModule,
    MongooseModule.forFeature([
      { name: "Community", schema: CommunitySchema },
      { name: "GroupSettings", schema: GroupSettingSchema },
      { name: "User", schema: UserSchema },
      { name: "room_member", schema: RoomMemberSchema },
    ]),
  ],
  controllers: [
    CommunityController,
    ChannelController,
    GroupChannelController,
    BroadcastChannelController,
    MessageChannelController,
  ],
  providers: [
    CommunityService,

    ChannelService,
    GroupChannelService,
    BroadcastChannelService,
    MessageChannelService,
    NotificationEmitterChannelService,
  ],
  exports: [CommunityService, ChannelService, MessageChannelService],
})
export class CommunityModule {}
