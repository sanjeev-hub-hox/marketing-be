import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobShadulerService } from './jobShaduler.service';
import { JobShadulerRepository } from './jobShaduler.repository';
import { jobShadulerSchema, JobShadulerSchema } from './jobShaduler.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: JobShadulerSchema.name,
        schema: jobShadulerSchema,
      },
    ]),
  ],
  providers: [
    JobShadulerService,
    JobShadulerRepository,
  ],
  exports: [
    JobShadulerService,
    JobShadulerRepository,
  ],
})
export class JobShadulerModule {}
