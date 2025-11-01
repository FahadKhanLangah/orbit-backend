import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JobSeekerProfile, JobSeekerProfileDocument } from './entity/job-seeker-profile.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateJobSeekerDto } from './dto/create-job-seeker.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { Job, JobDocument } from './entity/jobs.entity';
import { FindJobsDto } from './dto/find-job.dto';
import { FileUploaderService } from 'src/common/file_uploader/file_uploader.service';
import { IJobApplication } from './entity/job-application.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(JobSeekerProfile.name)
    private readonly profileModel: Model<JobSeekerProfileDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
    @InjectModel("Application")
    private readonly applicationModel: Model<IJobApplication>,
    private s3: FileUploaderService,
  ) { }

  async getJobApplicationsForEmployer(employerId: string) {

    const jobs = await this.jobModel.find({ employerId }).select('_id title');

    if (jobs.length === 0) {
      return { message: 'No jobs posted yet', applications: [] };
    }

    const jobIds = jobs.map((job) => job._id);

    const applications = await this.applicationModel
      .find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title category location')
      .populate({
        path: 'applierId',
        select: 'userId headline skills yearsOfExperience cvUrl',
        populate: {
          path: 'userId',
          select: 'fullName email profilePic',
        },
      })
      .sort({ createdAt: -1 })
      .lean() as (IJobApplication & { jobId: { _id: string; title: string } })[];

    const grouped = jobs.map((job) => ({
      jobId: job._id,
      title: job.title,
      applications: applications.filter(
        (app) => app.jobId && app.jobId._id.toString() === job._id.toString()
      ),
    }));

    return {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      jobs: grouped,
    };
  }

  async applyForJob(seekerId: string, jobId: string, file: any, coverLetter?: string) {
    const alreadyApplied = await this.applicationModel.findOne({ jobId, applierId: seekerId });
    if (alreadyApplied) {
      throw new ConflictException('You have already applied for this job');
    }
    const url = await this.s3.uploadPdf(file, seekerId);
    const appliedJob = await this.applicationModel.create({
      jobId: jobId,
      applierId: seekerId,
      coverLetter: coverLetter,
      cvUrl: url
    })
    return {
      message: 'Application submitted successfully',
      data: appliedJob
    };
  }

  async createJob(userId: string, createJobDto: CreateJobDto) {
    const job = new this.jobModel({
      ...createJobDto,
      employerId: userId,
    });
    return job.save();
  }

  async searchJobs(query?: string): Promise<Job[]> {
    if (query && query.trim().length > 0) {
      return this.jobModel.find(
        { $text: { $search: query }, isActive: true },
        { score: { $meta: 'textScore' } },
      )
        .sort({ score: { $meta: 'textScore' } })
        .populate('employerId', 'fullName')
        .exec();
    }

    return this.jobModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('employerId', 'fullName')
      .exec();
  }

  async getJobDetails(jobId: string): Promise<Job> {
    const job = await this.jobModel.findById(jobId)
      .populate('employerId', 'fullName email userImage')
      .exec();
    if (!job) {
      throw new NotFoundException('Job not found.');
    }
    return job;
  }

  async createOrUpdateProfile(userId: string, dto: CreateJobSeekerDto): Promise<JobSeekerProfile> {
    return this.profileModel.findOneAndUpdate(
      { userId },
      { userId, ...dto },
      { new: true, upsert: true },
    ).exec();
  }

  async getMyProfile(userId: string): Promise<JobSeekerProfile> {
    const profile = await this.profileModel.findOne({ userId }).exec();
    if (!profile) {
      throw new NotFoundException('Job seeker profile not found. Please create one.');
    }
    return profile;
  }

  async getSeekerProfile(userId: string): Promise<JobSeekerProfile> {
    const profile = await this.profileModel.findOne({ userId }).exec();
    if (!profile) {
      throw new NotFoundException('Job seeker profile not found.');
    }
    return profile;
  }

  async findAll(findJobsDto: FindJobsDto): Promise<{ data: Job[]; pagination: any }> {
    const { page = 1, limit = 10, q, category, location } = findJobsDto;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<JobDocument> = { isActive: true };

    if (q) {
      filter.$text = { $search: q };
    }

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = { $regex: new RegExp(location, 'i') };
    }

    const projection = q ? { score: { $meta: 'textScore' } } : {};

    try {
      const [jobs, total] = await Promise.all([
        this.jobModel
          .find(filter, projection).populate("employerId", "fullName bio userImage")
          .skip(skip)
          .limit(limit)
          .exec(),
        this.jobModel.countDocuments(filter),
      ]);

      return {
        data: jobs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
