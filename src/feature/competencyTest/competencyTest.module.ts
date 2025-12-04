import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdmissionModule } from '../admission/admission.module';
import { EnquiryModule } from '../enquiry/enquiry.module';
import { EnquiryLogModule } from '../enquiryLog/enquiryLog.module';
import { SlotModule } from '../slots/slot.module';
import { CompetencyTestController } from './competencyTest.controller';
import { CompetencyTestRepository } from './competencyTest.repository';
import { CompetencyTestSchema } from './competencyTest.schema';
import { CompetencyTestService } from './competencyTest.service';
import { AxiosService } from 'src/global/service';
import { CronService } from '../cron/cron.service';
import { EnquiryTypeRepository } from '../enquiryType/enquiryType.repository';
import { EnquiryTypeSchema } from '../enquiryType/enquiryType.schema';
import { WorkflowService } from '../workflow/workflow.service';
import { SlotMaster, SlotMasterSchema } from '../slots/schema';
import { SlotMasterRepository } from '../slots/repository';
import { MyTaskModule } from '../myTask/myTask.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'competencyTest', schema: CompetencyTestSchema },
      { name: 'enquiryType', schema: EnquiryTypeSchema },
      { name: SlotMaster.name, schema: SlotMasterSchema },
    ]),
    EnquiryModule,
    EnquiryLogModule,
    SlotModule,
    AdmissionModule,
    MyTaskModule
  ],
  providers: [
    CompetencyTestService,
    CompetencyTestRepository,
    EnquiryTypeRepository,
    AxiosService,
    WorkflowService,
    SlotMasterRepository
  ],
  controllers: [CompetencyTestController],
  exports: [CompetencyTestService, CompetencyTestRepository],
})
export class CompetencyTestModule { }
