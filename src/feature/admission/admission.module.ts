import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogRepository, AuditLogSchema } from 'ampersand-common-module';

import { Auth } from '../auth/auth.schema';
import { EnquiryModule } from '../enquiry/enquiry.module';
import { EnquiryLogModule } from '../enquiryLog/enquiryLog.module';
import { AdmissionController } from './admission.controller';
import { AdmissionRepository } from './admission.repository';
import { Admission, admissionSchema } from './admission.schema';
import { AdmissionService } from './admission.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admission.name.toLowerCase(), schema: admissionSchema },
      { name: 'auditLogs', schema: AuditLogSchema },
      { name: 'auth', schema: Auth },
    ]),
    forwardRef(() => EnquiryModule),
    EnquiryLogModule,
  ],
  controllers: [AdmissionController],
  providers: [AdmissionService, AdmissionRepository, AuditLogRepository],
  exports: [AdmissionService, AdmissionRepository],
})
export class AdmissionModule {}
