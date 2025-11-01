import { Document, Schema } from "mongoose";
import { Job } from "./jobs.entity";
import { JobSeekerProfile } from "./job-seeker-profile.schema";

export interface IJobApplication extends Document {
  _id: string,
  jobId: string,
  applierId: string,
  coverLetter: string,
  cvUrl: string
}

export const jobApplicationSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: Job.name },
  applierId: {type: Schema.Types.ObjectId, ref:JobSeekerProfile.name},
  coverLetter: {type : String},
  cvUrl: {type: String, }
}, { timestamps: true });
