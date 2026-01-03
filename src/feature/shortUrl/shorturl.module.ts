import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { shortUrlSchema } from "./shorturl.schema";
import { ShortUrlController } from "./shorturl.controller";
import { ShortUrlService } from "./shorturl.service";
import { ShortUrlRepository } from "./shorturl.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'shortUrl', schema: shortUrlSchema },
        ]),
    ],
    controllers: [ShortUrlController],
    providers: [ ShortUrlService, ShortUrlRepository],
    exports: [ ShortUrlService, ShortUrlRepository]
})
export class ShortUrlModule { }

