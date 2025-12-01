import { Body, Controller, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateJobSeekerDto } from './dto/create-job-seeker.dto';
import { FindJobsDto } from './dto/find-job.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBookDto } from './dto/create-book.dto';

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
  // comment on employee
  @Post('employee/:id/comment')
  async commentOnEmployee(
    @Req() req: any,
    @Param('id') employeeId: string,
    @Body('comment') comment: string,
    @Body('rating') rating: number
  ) {
    const commenterId = req.user._id;
    return this.jobsService.commentOnEmployee(employeeId, commenterId, comment, rating);
  }
  // get employee comments
  @Get('employee/:id/comments')
  async getEmployeeComments(
    @Param('id') employeeId: string
  ) {
    return this.jobsService.getEmployeeComments(employeeId);
  }

  //
  @Post('book/create')
  @UseInterceptors(FileInterceptor("coverImage"))
  async createBook(
    @Req() req: any,
    @Body(new ValidationPipe()) dto: CreateBookDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const authorId = req.user._id;
    return this.jobsService.createBook(authorId, dto,file);
  }

  @Get('books/all')
  async getAllBooks(
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.jobsService.getAllBooks(page, limit);
  }

  @Get('book/:id')
  async getBookDetails(
    @Req() req: any,
    @Param('id') bookId: string,
  ) {
    const userId = req.user._id;
    return this.jobsService.getBookDetails(bookId, userId);
  }

  @Post('book/:id/purchase')
  async purchaseBook(
    @Req() req: any,
    @Param('id') bookId: string,
  ) {
    const userId = req.user._id;
    return this.jobsService.purchaseBook(bookId, userId);
  }
}
