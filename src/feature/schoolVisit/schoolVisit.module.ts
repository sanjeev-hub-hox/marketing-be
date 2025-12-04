import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EnquiryModule } from '../enquiry/enquiry.module';
import { EnquiryLogModule } from '../enquiryLog/enquiryLog.module';
import { SlotModule } from '../slots/slot.module';
import { SchoolVisitController } from './schoolVisit.controller';
import { SchoolVisitRepository } from './schoolVisit.repository';
import { SchoolVisitSchema } from './schoolVisit.schema';
import { SchoolVisitService } from './schoolVisit.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'schoolVisits', schema: SchoolVisitSchema },
    ]),
    EnquiryLogModule,
    EnquiryModule,
    SlotModule,
  ],
  providers: [SchoolVisitService, SchoolVisitRepository],
  controllers: [SchoolVisitController],
  exports: [SchoolVisitService, SchoolVisitRepository],
})
export class SchoolVisitModule {}
