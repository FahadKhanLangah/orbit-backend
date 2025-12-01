import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JobSeekerProfile, JobSeekerProfileDocument } from './entity/job-seeker-profile.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateJobSeekerDto } from './dto/create-job-seeker.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { Job, JobDocument } from './entity/jobs.entity';
import { FindJobsDto } from './dto/find-job.dto';
import { FileUploaderService } from 'src/common/file_uploader/file_uploader.service';
import { IJobApplication } from './entity/job-application.entity';
import { IEmployeeComment } from './entity/employee-comments.entity';
import { IBook } from './entity/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(JobSeekerProfile.name)
    private readonly profileModel: Model<JobSeekerProfileDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
    @InjectModel("Application")
    private readonly applicationModel: Model<IJobApplication>,
    @InjectModel("EmployeeComment")
    private readonly commentModel: Model<IEmployeeComment>,
    @InjectModel("Book")
    private readonly bookModel: Model<IBook>,
    @InjectModel("User")
    private readonly userModel: Model<IUser>,
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
  // comment on employee
  async commentOnEmployee(employeeId: string, commenterId: string, comment: string, rating: number) {
    await this.commentModel.create({
      employeeId,
      commenterId,
      comment,
      rating
    })
    return { message: 'Comment added successfully' };
  }
  // get specific employee comments
  async getEmployeeComments(employeeId: string) {
    const comments = await this.commentModel.find({ employeeId })
      .populate('commenterId', 'fullName profilePic')
      .sort({ createdAt: -1 })
      .lean();
    return comments;
  }

  // create book
  async createBook(authorId: string, bookData: CreateBookDto, file: Express.Multer.File) {
    let coverKey: string = null;
    if (file) {
      coverKey = await this.s3.uploadBookCover(file, authorId);
    }

    const book = new this.bookModel({
      ...bookData,
      coverImage: coverKey
    });
    book.author = authorId;
    return book.save();
  }

  async getAllBooks(page: number = 1, limit: number = 20) {
    const books = await this.bookModel.find().select("_id author title price isForSale previewText purchasedBy likes views createdAt").skip((page - 1) * limit).limit(limit)
      .populate('author', 'fullName userImage')
      .sort({ createdAt: -1 });
    return books;
  }

  async getBookDetails(bookId: string, userId: string) {
    const book = await this.bookModel.findById(bookId).populate('author', 'fullName userImage');
    if (!book) throw new NotFoundException('Book not found');
    book.views += 1;
    await book.save();
    const bookObj = book.toObject();
    const isAuthor = bookObj.author === userId.toString();
    const hasPurchased = bookObj.purchasedBy.some(buyerId => buyerId.toString() === userId.toString());
    if (book.isForSale && book.price > 0) {
      if (!hasPurchased && !isAuthor) {
        delete bookObj.fullContent;
        bookObj['hasAccess'] = false;
      } else {
        bookObj['hasAccess'] = true;
      }
    } else {
      bookObj['hasAccess'] = true;
    }

    return bookObj;
  }

  async purchaseBook(bookId: string, userId: string) {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');
    if (!book.isForSale || book.price <= 0) {
      throw new ConflictException('This book is not for sale');
    }
    const hasPurchased = book.purchasedBy.some(buyerId => buyerId.toString() === userId.toString());
    if (hasPurchased) {
      throw new ConflictException('You have already purchased this book');
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.balance < book.price) {
      throw new ConflictException('Insufficient balance to purchase this book');
    }
    user.balance -= book.price;
    await user.save();
    book.purchasedBy.push(userId);
    await book.save();
    return { message: 'Book purchased successfully' };
  }
}
