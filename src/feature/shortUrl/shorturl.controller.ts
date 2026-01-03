import { Controller, Post, Body, Get, Param, Query, HttpException, HttpStatus } from "@nestjs/common";
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

    // ✅ NEW: Check if a URL is valid
    @Get('validate/url')
    async validateUrl(@Query('url') url: string) {
        if (!url) {
            throw new HttpException('URL parameter is required', HttpStatus.BAD_REQUEST);
        }

        const isValid = await this.shortUrlService.isUrlValid(url);

        return {
            status: isValid ? 200 : 410, // 410 = Gone (expired)
            valid: isValid,
            message: isValid 
                ? 'URL is valid and active' 
                : 'URL not found or has expired',
        };
    }

    // ✅ NEW: Get URL details by full URL
    @Post('find-by-url')
    async findByUrl(@Body('url') url: string) {
        if (!url) {
            throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
        }

        const shortUrl = await this.shortUrlService.getByUrl(url);

        if (!shortUrl) {
            throw new HttpException('URL not found or expired', HttpStatus.NOT_FOUND);
        }

        return {
            status: 200,
            data: shortUrl,
        };
    }
}