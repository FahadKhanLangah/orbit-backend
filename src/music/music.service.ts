import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileUploaderService } from 'src/common/file_uploader/file_uploader.service';
import { IAudio } from './entity/audio.schema';
import { IVideo } from './entity/video.schema';
import { ISupport } from './entity/support.schema';
import { CreateAudioDto } from './dto/create-audio.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { SupportDto } from './dto/support.dto';

@Injectable()
export class MusicService {

  constructor(
    private readonly fileUploaderService: FileUploaderService,
    @InjectModel("Audio") private readonly audioModel: Model<IAudio>,
    @InjectModel("Video") private readonly videoModel: Model<IVideo>,
    @InjectModel("Support") private readonly supportModel: Model<ISupport>,
  ) { }

  async uploadAudio(
    userId: string,
    file: Express.Multer.File,
    dto: CreateAudioDto
  ) {
    if (!file) throw new BadRequestException("Audio file is required.");

    const key = await this.fileUploaderService.uploadMediaFile(
      file,
      "audio",
      userId,
      true
    );

    const audio = new this.audioModel({
      userId,
      title: dto.title,
      description: dto.description,
      fileUrl: key,
    });

    return audio.save();
  }

  async uploadVideo(
    userId: string,
    file: Express.Multer.File,
    dto: CreateVideoDto
  ) {
    if (!file) throw new BadRequestException("Video file is required.");

    const key = await this.fileUploaderService.uploadMediaFile(
      file,
      "videos",
      userId,
      true
    );

    const video = new this.videoModel({
      userId,
      title: dto.title,
      description: dto.description,
      fileUrl: key,
    });

    return video.save();
  }

  async getAllAudio(limit?: number, offset?: number) {
    return this.audioModel.find().populate("userId", "fullName userImage").limit(limit || 0).skip(offset || 0);
  }

  async getAudioById(id: string) {
    return this.audioModel.findById(id).populate("userId", "fullName userImage");
  }

  async getAllVideos(limit?: number, offset?: number) {

    return this.videoModel.find().populate("userId", "fullName userImage").limit(limit || 0).skip(offset || 0);
  }

  async getVideoById(id: string) {
    return this.videoModel.findById(id).populate("userId", "fullName userImage");
  }

  async supportArtist(fromUser: string, dto: SupportDto) {
    const support = new this.supportModel({
      fromUser,
      toUser: dto.toUser,
      amount: dto.amount,
      status: "PENDING",
    });

    const saved = await support.save();

    return {
      message: "Support request initiated",
      supportId: saved._id
    };
  }

}
