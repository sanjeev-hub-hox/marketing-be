import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EnquiryStageModule } from '../enquiryStage/enquiryStage.module';
import { EnquiryTypeController } from './enquiryType.controller';
import { EnquiryTypeRepository } from './enquiryType.repository';
import { EnquiryTypeSchema } from './enquiryType.schema';
import { EnquiryTypeService } from './enquiryType.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'enquiryType', schema: EnquiryTypeSchema },
    ]),
    EnquiryStageModule,
  ],
  controllers: [EnquiryTypeController],
  providers: [EnquiryTypeService, EnquiryTypeRepository],
  exports: [EnquiryTypeService, EnquiryTypeRepository],
})
export class EnquiryTypeModule {}
