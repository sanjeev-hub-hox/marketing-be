import { Controller, Post, Body, Get, Param, Patch} from "@nestjs/common";
import { JobShadulerService } from "./jobShaduler.service";
import { JobShadulerDto } from "./jobShaduler.type";


@Controller('jobShaduler')
export class JobShadulerController {
    constructor(private readonly jobShadulerService: JobShadulerService) {}

    @Post('create')
    async createJob(@Body() logData: JobShadulerDto) {
        return await this.jobShadulerService.createLog(logData);
    }

    @Get('get-job/:jobId')
    async getLogsByJobId(@Param('jobId') jobId: string) {
        return await this.jobShadulerService.getOneByJobId(jobId);
    }

    @Patch('update-job/:jobId')
    async updateJob(@Param('jobId') jobId: string, @Body() logData: JobShadulerDto) {
        return await this.jobShadulerService.updateJob(jobId, logData);
    }

    // @Get('all')
    // async getAllLogs() {
    //     return await this.jobShadulerService.getAllLogs();
    // }
}