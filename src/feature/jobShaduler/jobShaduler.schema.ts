import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';

@Schema({
  collection: 'jobShaduler',
  timestamps: { createdAt: 'created_at' },
})
export class JobShadulerSchema {
  @Prop({ required: true })
  jobId: Number;

  @Prop({ required: false })
  user: string;

  @Prop({ required: false })
  event: string;

  @Prop({ required: false })
  jobData: mongoose.Schema.Types.Mixed;

  @Prop({ type: Date, expires: '30m', default: Date.now })
  created_at: Date;
}

export type JobShadulerDocument = HydratedDocument<JobShadulerSchema>;
export const jobShadulerSchema = SchemaFactory.createForClass(JobShadulerSchema);
export type JobShadulerModel = Model<JobShadulerSchema>;
