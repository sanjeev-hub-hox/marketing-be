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
  // Add this method to your CSV service class

  async generateCsvWithPercentages(
    data: any[],
    fields: string[],
    filename: string,
    percentageFields: string[]
  ): Promise<{ csv: string }> {
    const csvRows = [];
    
    // Add header row
    csvRows.push(fields.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = fields.map(field => {
        let value = row[field];
        
        // Handle percentage fields
        if (percentageFields.includes(field)) {
          if (value === null || value === undefined) {
            return '#DIV/0!';
          }
          // Convert decimal to percentage string
          return `${Math.round(value * 100)}%`;
        }
        
        // Handle other fields
        if (value === null || value === undefined) {
          return '';
        }
        
        // Escape commas and quotes in CSV
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
        }
        
        return value;
      });
      
      csvRows.push(values.join(','));
    }
    
    return {
      csv: csvRows.join('\n')
    };
  }
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
