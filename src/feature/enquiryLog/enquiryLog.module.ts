import { Module } from "@nestjs/common";
import { EnquiryLogController } from "./enquiryLog.controller";
import { EnquiryLogRepository } from "./enquiryLog.repository";
import { EnquiryLogService } from "./enquiryLog.service";
import { MongooseModule } from "@nestjs/mongoose";
import { GlobalModule } from "../../global/global.module";
import { enquiryLogSchema } from "./enquiryLog.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'enquiryLogs', schema: enquiryLogSchema },
        ]),
    ],
    controllers: [EnquiryLogController],
    providers: [EnquiryLogService,EnquiryLogRepository],
    exports: [EnquiryLogService,EnquiryLogRepository]
})
export class EnquiryLogModule { }