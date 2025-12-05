import { Controller, Post, Body} from "@nestjs/common";
import { ParentLoginLogService } from "./parentLoginLogs.service";
import { ParentActionLogs } from "./parentLoginLogs.type";

@Controller('parent-login-logs')
export class ParentLoginLogController {
    constructor(private readonly parentLoginLogService: ParentLoginLogService) {}

    @Post()
    async createLog(@Body() logData: ParentActionLogs) {
        return await this.parentLoginLogService.createLog(logData);
    }

    // You can add more endpoints as needed
    // @Get()
    // async getAllLogs() {
    //     return await this.parentLoginLogService.findAll();
    // }
}