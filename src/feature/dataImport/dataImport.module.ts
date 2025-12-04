import { Module } from '@nestjs/common';
import { DataImportController } from './dataImport.controller';
import { ResponseService } from 'src/utils';
import { DataImportService } from './dataImport.service';
import { MongooseModule } from '@nestjs/mongoose';
import { demoExcelsSchema } from './demo_excel.schema';
import { GoogleCloudStorageService, LocalStorageService, S3StorageService, StorageService } from 'ampersand-common-module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'demoExcels', schema: demoExcelsSchema },]),
  ],
  controllers: [DataImportController],
  providers: [ResponseService, DataImportService, StorageService,
    LocalStorageService,
    
    S3StorageService,
    GoogleCloudStorageService,ConfigService],
})
export class DataImportModule { }
