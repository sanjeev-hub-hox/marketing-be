import { MongooseModule } from "@nestjs/mongoose";
import { enquirySchema } from "../enquiry/enquiry.schema";
import { enquiryStageSchema } from "../enquiryStage/enquiryStage.schema";
import { EnquiryTypeSchema } from "../enquiryType/enquiryType.schema";
import { AuditLogRepository, AuditLogSchema, GoogleCloudStorageService, LocalStorageService, S3StorageService, StorageService } from "ampersand-common-module";
import { Module, forwardRef } from "@nestjs/common";
import { AxiosService } from "src/global/service";
import { AdmissionModule } from "../admission/admission.module";
import { EnquiryStageUpdateService } from "../enquiry/EnquiryStageUpdate.service";
import { EnquiryController } from "../enquiry/enquiry.controller";
import { CheckRequiredFieldsGuard } from "../enquiry/enquiry.guard";
import { EnquiryRepository } from "../enquiry/enquiry.repository";
import { EnquiryService } from "../enquiry/enquiry.service";
import { EnquiryHelper } from "../enquiry/enquiryHelper.service";
import { EnquiryLogModule } from "../enquiryLog/enquiryLog.module";
import { EnquiryTypeModule } from "../enquiryType/enquiryType.module";
import { WorkflowService } from "./workflow.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'enquiry', schema: enquirySchema },
            { name: 'enquiryStage', schema: enquiryStageSchema },
            { name: 'enquiryType', schema: EnquiryTypeSchema },
            { name: 'auditLogs', schema: AuditLogSchema },
        ]),
        EnquiryTypeModule,
        EnquiryLogModule,
    ],
    providers: [
        EnquiryService,
        EnquiryRepository,
        AxiosService,
    ],
    exports: [WorkflowService],
})
export class WorkflowModule { }