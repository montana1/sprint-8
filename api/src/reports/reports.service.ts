import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  getReport(): string {
    return "This is report!";
  }
}
