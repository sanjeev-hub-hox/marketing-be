import { Injectable } from '@nestjs/common';

class CSVWriter {
  private fields: string[];

  constructor({ fields }: { fields: string[] }) {
    this.fields = fields;
  }

  sanitize(value: any): string {
    const sanitizedValue = String(value)
      .replace(/[\r\n]+/g, ' ')
      .replace(/"/g, '""')
      .trim();
    return sanitizedValue;
  }

  write(data: any[]): string {
    let csv = '';

    // Write header
    csv += this.fields.join(',') + '\n';

    // Write data
    data.forEach((row) => {
      const rowData = this.fields.map((field) => {
        const value =
          row[field] !== undefined && row[field] !== null ? row[field] : 'NA';
        return `"${this.sanitize(value)}"`;
      });
      csv += rowData.join(',') + '\n';
    });

    return csv;
  }
}

@Injectable()
export class CsvService {
  async generateCsv(
    data: any[],
    fields: string[],
    fileName: string,
  ): Promise<string> {
    try {
      const parser = new CSVWriter({ fields });
      const csv = parser.write(data);
      const filename = `${fileName}.csv`;

      const csvFile: any = { filename: filename, csv: csv };
      return csvFile;
    } catch (error) {
      throw new Error(`Error generating CSV: ${error.message}`);
    }
  }
}
