import { Injectable } from '@nestjs/common';
import { Config, ExcelImporter } from 'ampersand-common-module';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import axios from 'axios';

@Injectable()
export class DataImportService {
  private readonly unlinkAsync = promisify(fs.unlink);
  
  constructor(
  ) { }

  async importExcelMongo(filePath: string, ext: "xlsx" | "csv" | "html", colMap: any,uniqueField: string, action: "bulkAdd" | "bulkUpdate" | "bulkUpsert", TableModel: any) {
    const adminUrl = "https://admin-panel-backend-r26sp3mibq-uc.a.run.app/";
    try {
      const config: Config = {
        filePath: `${adminUrl}uploads/${filePath}`,
        type: 'mongo',
        ext: `xlsx`,
        uniqueField: uniqueField,
        dtoSchemaSelected: null,
        colMap:colMap,
        modelAction:action
      }
      const ExcelImporterObject = await new ExcelImporter(config);
      ExcelImporterObject.setModelService(TableModel);
      const importedData = await ExcelImporterObject.import();
      axios.get(`${adminUrl}admin/dataImport/delete/file/${filePath}?interservice=true`);
      return importedData;
    } catch (error) {
      axios.get(`$${adminUrl}admin/dataImport/delete/file/${filePath}?interservice=true`);
      console.log(error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const absolutePath = path.resolve(filePath);
      await this.unlinkAsync(absolutePath);

    } catch (error) {
      console.log(`Failed to delete file: ${filePath}`);
    }
  }
}
