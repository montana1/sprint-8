import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  generateCSVReport() {
    return this.generateRandomData(100);
  }

  private generateRandomData(rows: number) {
    const data = Array.from({ length: rows }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
    }));

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) => Object.values(row).join(',')),
    ];
    const csvContent = csvRows.join('\n');

    return csvContent;
  }
}
