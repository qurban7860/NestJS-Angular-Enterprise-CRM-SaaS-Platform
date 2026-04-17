import { Injectable } from '@nestjs/common';

@Injectable()
export class CsvExportService {
  public generateCsv<T extends Record<string, any>>(
    data: T[],
    customHeaders?: string[],
  ): string {
    if (!data || data.length === 0) {
      return customHeaders ? customHeaders.join(',') : '';
    }

    const headers = customHeaders || Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const val = row[header];
        const escaped = this.escapeCsvValue(val);
        return escaped;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private escapeCsvValue(val: any): string {
    if (val === null || val === undefined) {
      return '';
    }
    if (val instanceof Date) {
      return val.toISOString();
    }
    const str = String(val);
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
