import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdmissionRepository } from '../admission/admission.repository';
import { admissionSchema } from '../admission/admission.schema';
import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { enquirySchema } from '../enquiry/enquiry.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'enquiry', schema: enquirySchema },
      { name: 'admission', schema: admissionSchema },
    ]),
  ],
  providers: [DashboardService, EnquiryRepository, AdmissionRepository],
  controllers: [DashboardController],
})
export class DashboardModule {}
