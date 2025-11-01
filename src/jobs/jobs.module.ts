import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './entity/jobs.entity';
import { JobSeekerProfile, JobSeekerProfileSchema } from './entity/job-seeker-profile.schema';
import { AuthModule } from 'src/api/auth/auth.module';
import { FileUploaderModule } from 'src/common/file_uploader/file_uploader.module';
import { jobApplicationSchema } from './entity/job-application.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobSeekerProfile.name, schema: JobSeekerProfileSchema },
      { name: "Application", schema: jobApplicationSchema }
    ]),
    AuthModule,
    FileUploaderModule
  ],
  providers: [JobsService],
  controllers: [JobsController]
})
export class JobsModule { }
