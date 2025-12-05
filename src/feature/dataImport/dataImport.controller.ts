import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataImportService } from './dataImport.service';
import { ResponseService } from 'src/utils';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { demoExcels } from './demo_excel.schema';
import { ExcelImportDto } from './dto/dataImport.dto';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { EStorageType, StorageService } from 'ampersand-common-module';

@ApiTags('Data Import')
@Controller('dataImport')
export class DataImportController {
  constructor(
    private dataImportService: DataImportService,
    private responseService: ResponseService,
    @InjectModel('demoExcels') private readonly demoExcelsModel: Model<demoExcels>,
    public readonly configService: ConfigService,
    private storageService: StorageService,
  ) {
  }

  @Post('import/mongo')
  async importExcel(
    @Res() res: Response,
    @Body() reqBody: ExcelImportDto,
  ) {
    try {
      let ext: any = reqBody.filePath.split('.').pop()
      const response = await this.dataImportService.importExcelMongo(`${reqBody.filePath}`, ext, reqBody.colMap, reqBody.uniqueField, reqBody.action, this.demoExcelsModel);
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        response,
        `${reqBody.action} operation completed`,
      );
    } catch (err: Error | unknown | any) {
      console.log(err);
      throw new HttpException(
        { message: `operation error : ${JSON.stringify(err?.message)}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  @Post('upload')
  @ApiOperation({ summary: 'Import data from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Excel file to import',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() reqBody: any,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      await this.storageService.setStorage(EStorageType.LOCAL);
      const result = await this.storageService.uploadFile(file);
      return this.responseService.sendResponse(res, HttpStatus.OK, result, 'Uploaded...');
    } catch (err) {
      throw new HttpException(
        { message: 'Err occured while creating cluster', error: err },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
