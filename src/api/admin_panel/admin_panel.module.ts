/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from "@nestjs/common";
import { AdminPanelService } from "./admin_panel.service";
import { AdminPanelController } from "./admin_panel.controller";
import { AppConfigModule } from "../app_config/app_config.module";
import { ConfigModule } from "@nestjs/config";
import { NotificationEmitterModule } from "../../common/notification_emitter/notification_emitter.module";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user_modules/user/user.module";
import { FileUploaderModule } from "../../common/file_uploader/file_uploader.module";
import { UserDeviceModule } from "../user_modules/user_device/user_device.module";
import { VersionsModule } from "../versions/versions.module";
import { AdminNotificationModule } from "../admin_notification/admin_notification.module";
import { UserCountryModule } from "../user_modules/user_country/user_country.module";
import { NotificationEmitterAdminService } from "./other/notification_emitter_admin.service";
import { UserAdminService } from "./other/user_admin.service";
import { UserCountryAdminService } from "./other/user_country_admin.service";
import { UserDeviceAdminService } from "./other/user_device_admin.service";
import { VersionsAdminService } from "./other/versions_admin.service";
import { SocketIoModule } from "../../chat/socket_io/socket_io.module";
import { ChannelModule } from "../../chat/channel/channel.module";
import { ChannelAdminService } from "./other/channel_admin_service";
import { RoomMemberModule } from "../../chat/room_member/room_member.module";
import { SingleRoomSettingsModule } from "../../chat/single_room_settings/single_room_settings.module";
import { GroupSettingsModule } from "../../chat/group_settings/group_settings.module";
import { BroadcastSettingsModule } from "../../chat/broadcast_settings/broadcast_settings.module";
import { OrderRoomSettingsModule } from "../../chat/order_room_settings/order_room_settings.module";
import { MessageModule } from "../../chat/message/message.module";
import { ReportSystemModule } from "../report_system/report_system.module";
import { GroupMemberModule } from "../../chat/group_member/group_member.module";
import { StoryModule } from "../stories/story/story.module";
import { GiftModule } from "../gifts/gift.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./category/category.schema";
import { CategoryService } from "./category/category.service";
import { SubscriptionPlanService } from "../subscription-plan/subscription-plan.service";
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from "../user_modules/user/entities/subscription_plan.entity";
import { TransactionService } from "../transactions/transaction.service";
import {
  Settings,
  SettingsSchema,
} from "../setting/schema/settings.schema";
import { SettingsModule } from "../setting/settings.module";
import { TransactionSchema } from "../transactions/schemas/transaction.schema";
import { VerificationModule } from "../verification/verification.module";
import { DriverModule } from "src/ride/driver/driver.module";
import { RidesModule } from "src/ride/rides/rides.module";
import { ListingModule } from "src/marketplace/listing/listing.module";
@Module({
  controllers: [AdminPanelController],
  providers: [
    AdminPanelService,
    NotificationEmitterAdminService,
    UserAdminService,
    UserCountryAdminService,
    UserDeviceAdminService,
    VersionsAdminService,
    ChannelAdminService,
    CategoryService,
    SubscriptionPlanService,
    TransactionService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: Settings.name, schema: SettingsSchema },
      { name: "Transaction", schema: TransactionSchema },
    ]),
    UserModule,
    AuthModule,
    FileUploaderModule,
    NotificationEmitterModule,
    ConfigModule,
    AppConfigModule,
    UserDeviceModule,
    VersionsModule,
    AdminNotificationModule,
    UserCountryModule,
    SocketIoModule,
    ChannelModule,
    RoomMemberModule,
    SingleRoomSettingsModule,
    GroupSettingsModule,
    BroadcastSettingsModule,
    MessageModule,
    OrderRoomSettingsModule,
    ReportSystemModule,
    GroupMemberModule,
    StoryModule,
    GiftModule,
    SocketIoModule,
    SettingsModule,
    VerificationModule,
    DriverModule,
    RidesModule,
    ListingModule,
  ],
})
export class AdminPanelModule { }
