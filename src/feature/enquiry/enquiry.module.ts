import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditLogRepository,
  AuditLogSchema,
  GoogleCloudStorageService,
  LocalStorageService,
  S3StorageService,
  StorageService,
} from 'ampersand-common-module';
import { AxiosService } from 'src/global/service';

import { GlobalModule } from '../../global/global.module';
import { AdmissionModule } from '../admission/admission.module';
import { AuthModule } from '../auth/auth.module';
import { CsvService } from '../csv/csv.service';
import { EnquiryLogModule } from '../enquiryLog/enquiryLog.module';
import { EnquiryStageModule } from '../enquiryStage/enquiryStage.module';
import { enquiryStageSchema } from '../enquiryStage/enquiryStage.schema';
import { EnquiryTypeModule } from '../enquiryType/enquiryType.module';
import { EnquiryTypeSchema } from '../enquiryType/enquiryType.schema';
import { FileService } from '../file/file.service';
import { MyTaskModule } from '../myTask/myTask.module';
import { PdfService } from '../pdf/pdf.service';
import { WorkflowService } from '../workflow/workflow.service';
import { EnquiryController } from './enquiry.controller';
import { EnquiryCron } from './enquiry.cron';
import { CheckRequiredFieldsGuard } from './enquiry.guard';
import { EnquiryRepository } from './enquiry.repository';
import { enquirySchema } from './enquiry.schema';
import { EnquiryService } from './enquiry.service';
import { EnquiryHelper } from './enquiryHelper.service';
import { EnquiryStageUpdateService } from './EnquiryStageUpdate.service';
import { AdmissionFeeQueueSubscriber } from './queueSubscriber';
import { ParentLoginLogModule } from '../parentLoginLogs/parentLoginLogs.module';
import { JobShadulerModule } from '../jobShaduler/jobShaduler.module';
import { ReferralReminderModule } from '../referralReminder/referralReminder.module';


@Module({
  imports: [
    BullModule.registerQueue({
      name: 'admissionFees',
    }),
    MongooseModule.forFeature([
      { name: 'enquiry', schema: enquirySchema },
      { name: 'enquiryStage', schema: enquiryStageSchema },
      { name: 'enquiryType', schema: EnquiryTypeSchema },
      { name: 'auditLogs', schema: AuditLogSchema },
    ]),
    GlobalModule,
    EnquiryStageModule,
    EnquiryTypeModule,
    EnquiryLogModule,
    forwardRef(() => AdmissionModule),
    MyTaskModule,
    AuthModule,
    ParentLoginLogModule,
    JobShadulerModule,
    forwardRef(() => ReferralReminderModule)
  ],
  providers: [
    EnquiryService,
    EnquiryRepository,
    EnquiryHelper,
    CheckRequiredFieldsGuard,
    StorageService,
    LocalStorageService,
    S3StorageService,
    GoogleCloudStorageService,
    AuditLogRepository,
    EnquiryStageUpdateService,
    AxiosService,
    WorkflowService,
    PdfService,
    FileService,
    CsvService,
    AdmissionFeeQueueSubscriber,
    EnquiryCron,
  ],
  controllers: [EnquiryController],
  exports: [EnquiryService, EnquiryRepository, EnquiryHelper],
})
export class EnquiryModule {}
