import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { AuthModule } from 'src/api/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AudioSchema } from './entity/audio.schema';
import { VideoSchema } from './entity/video.schema';
import { SupportSchema } from './entity/support.schema';
import { FileUploaderModule } from 'src/common/file_uploader/file_uploader.module';

@Module({
  controllers: [MusicController],
  providers: [MusicService],
  imports: [AuthModule,
    MongooseModule.forFeature([
      { name: "Audio", schema: AudioSchema },
      { name: "Video", schema: VideoSchema },
      { name: "Support", schema: SupportSchema },
    ]),
    FileUploaderModule
  ],
})
export class MusicModule { }
