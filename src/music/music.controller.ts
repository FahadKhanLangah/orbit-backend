import { Body, Controller, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { MusicService } from './music.service';
import { CreateAudioDto } from './dto/create-audio.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { V1Controller } from 'src/core/common/v1-controller.decorator';

@UseGuards(VerifiedAuthGuard)
@V1Controller("music")
export class MusicController {
  constructor(
    private readonly mediaService: MusicService,
  ) { }
  @Post("audio/upload")
  @UseInterceptors(FileInterceptor("audioFile"))
  uploadAudio(
    @Req() req,
    @UploadedFile() file,
    @Body() dto: CreateAudioDto
  ) {
    return this.mediaService.uploadAudio(req.user._id, file, dto);
  }

  @Post("video/upload")
  @UseInterceptors(FileInterceptor("videoFile"))
  uploadVideo(
    @Req() req,
    @UploadedFile() file,
    @Body() dto: CreateVideoDto
  ) {
    return this.mediaService.uploadVideo(req.user._id, file, dto);
  }

  @Get("audio/list")
  getAudioList(
    @Query() query: any
  ) {
    return this.mediaService.getAllAudio(query?.limit, query?.offset);
  }

  @Get("video/list")
  getVideoList(
    @Query() query: any
  ) {
    return this.mediaService.getAllVideos(query?.limit, query?.offset);
  }

  @Get("audio/:id")
  getAudioById(
    @Param("id") id: string
  ) {
    return this.mediaService.getAudioById(id);
  }

  @Get("video/:id")
  getVideoById(
    @Param("id") id: string
  ) {
    return this.mediaService.getVideoById(id);
  }

}
