import { Types } from 'mongoose';

export type JobShadulerDto = {
  _id?: Types.ObjectId;
  jobId?: number;
  user?: string;
  event?: string;
  jobData?: any;
};

