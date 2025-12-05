import { Module } from "@nestjs/common";
import { ParentLoginLogController } from "./parentLoginLogs.controller";
import { ParentLoginLogRepository } from "./parentLoginLogs.repository";
import { ParentLoginLogService } from "./parentLoginLogs.service";
import { MongooseModule } from "@nestjs/mongoose";
import { parentLoginLogsSchema } from "./parentLoginLogs.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'parentLoginLogs', schema: parentLoginLogsSchema },
        ]),
    ],
    controllers: [ParentLoginLogController],
    providers: [ParentLoginLogService, ParentLoginLogRepository],
    exports: [ParentLoginLogService, ParentLoginLogRepository]
})
export class ParentLoginLogModule { }

