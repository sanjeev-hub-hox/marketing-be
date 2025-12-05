import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EnquiryStageController } from './enquiryStage.controller';
import { EnquiryStageRepository } from './enquiryStage.repository';
import { enquiryStageSchema } from './enquiryStage.schema';
import { EnquiryStageService } from './enquiryStage.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'enquiryStage', schema: enquiryStageSchema },
    ]),
  ],
  controllers: [EnquiryStageController],
  providers: [EnquiryStageService, EnquiryStageRepository],
  exports: [EnquiryStageService, EnquiryStageRepository],
})
export class EnquiryStageModule {}
