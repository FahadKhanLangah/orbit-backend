import { Body, Controller, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateJobSeekerDto } from './dto/create-job-seeker.dto';
import { FindJobsDto } from './dto/find-job.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(VerifiedAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService
  ) { }
  @Post("create/job")
  async createJob(
    @Req() req: any,
    @Body(new ValidationPipe()) dto: CreateJobDto,
  ) {
    const employerId = req.user._id;
    return this.jobsService.createJob(employerId, dto);
  }

   @Get("get-all")
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    )
    findJobsDto: FindJobsDto,
  ) {
    return this.jobsService.findAll(findJobsDto);
  }

  @Get('search')
  async searchJobs(@Query('q') query?: string) {
    return this.jobsService.searchJobs(query);
  }

  @Get(':id')
  async getJobDetails(@Param('id') jobId: string) {
    return this.jobsService.getJobDetails(jobId);
  }

  @UseInterceptors(FileInterceptor("resume"))
  @Post(':id/apply')
  async applyForJob(
    @Req() req: any,
    @Param('id') jobId: string,
    @Body() body: any,
    @UploadedFile() file?: any
  ) {
    const { coverLetter } = body;
    const seekerUserId = req.user._id;
    return this.jobsService.applyForJob(seekerUserId, jobId, file, coverLetter);
  }

  @Put('profile/create-or-update')
  async createOrUpdateProfile(
    @Req() req: any,
    @Body(new ValidationPipe()) dto: CreateJobSeekerDto,
  ) {
    const userId = req.user._id;
    return this.jobsService.createOrUpdateProfile(userId, dto);
  }

  @Get('profile/me')
  async getMyProfile(@Req() req: any) {
    const userId = req.user._id;
    return this.jobsService.getMyProfile(userId);
  }

  @Get("applications/applied")
  async getApplications(
    @Req() req: any
  ) {
    const userId = req.user._id;
    return await this.jobsService.getJobApplicationsForEmployer(userId);
  }
}
