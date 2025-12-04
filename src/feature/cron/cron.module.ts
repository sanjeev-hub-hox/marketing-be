import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { enquirySchema } from "../enquiry/enquiry.schema";
import { enquiryStageSchema } from "../enquiryStage/enquiryStage.schema";
import { EnquiryTypeSchema } from "../enquiryType/enquiryType.schema";
import { AuditLogSchema } from "ampersand-common-module";
import { GlobalModule } from "src/global/global.module";
import { EnquiryService } from "../enquiry/enquiry.service";
import { CronService } from "./cron.service";
import { EnquiryRepository } from "../enquiry/enquiry.repository";
import { EnquiryLogRepository } from "../enquiryLog/enquiryLog.repository";
import { EnquiryLogSchema } from "../enquiryLog/enquiryLog.schema";
import { EnquiryTypeRepository } from "../enquiryType/enquiryType.repository";
import { AxiosService } from "src/global/service";
import { ReferralReminderModule } from '../referralReminder/referralReminder.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'enquiry', schema: enquirySchema },
    { name: 'enquiryStage', schema: enquiryStageSchema },
    { name: 'enquiryType', schema: EnquiryTypeSchema },
    { name: 'enquiryLogs', schema: EnquiryLogSchema },]),
    GlobalModule, ReferralReminderModule],
  providers: [
    CronService,
    EnquiryRepository,
    EnquiryLogRepository,
    EnquiryTypeRepository,
    AxiosService
  ],
  exports: [CronService]
})
export class CronModule { }