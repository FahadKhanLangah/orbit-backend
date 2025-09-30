import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule'; // For the cron job

import { AdController } from './ad.controller';
import { AdService } from './ad.service';
import { Ad, AdSchema } from './schema/ad.schema';


import { FileUploaderModule } from 'src/common/file_uploader/file_uploader.module';
import { UserModule } from '../user_modules/user/user.module';
import { TransactionModule } from '../transactions/transaction.module';
import { SettingsModule } from '../setting/settings.module';
import { Settings, SettingsSchema } from '../setting/schema/settings.schema';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    // 1. Initialize the scheduler for cron jobs
    ScheduleModule.forRoot(),
    
    // 2. Register the Ad and AdSetting schemas for use in this module
    MongooseModule.forFeature([
      { name: Ad.name, schema: AdSchema },
      { name: Settings.name, schema: SettingsSchema },
    ]),
    SettingsModule,
    TransactionModule,
    FileUploaderModule,
    UserModule,
    AuthModule
  ],
  controllers: [
    // 4. Register the controller
    AdController
  ],
  providers: [
    // 5. Register the service
    AdService
  ],
  exports: [
    // 6. (Optional) Export the service for other modules to use
    AdService
  ],
})
export class AdModule {}