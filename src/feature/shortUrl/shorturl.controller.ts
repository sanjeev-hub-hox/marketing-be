import { Controller, Post, Body, Get, Param} from "@nestjs/common";
import { ShortUrlService } from "./shorturl.service";
import { ShortUrlDTO } from "./shorturl.type";

@Controller('shortUrl')
export class ShortUrlController {
    constructor(private readonly shortUrlService: ShortUrlService) {}

    @Post()
    async createUrl(@Body() logData: ShortUrlDTO) {
        return await this.shortUrlService.createUrl(logData);
    }

    @Get(':id')
    async getUrl(@Param('id') id: string) {
        return await this.shortUrlService.getByHashUrl(id);
    }
    // You can add more endpoints as needed
    // @Get()
    // async getAllLogs() {
    //     return await this.parentLoginLogService.findAll();
    // }
}