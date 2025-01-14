import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getReport(): Promise<string> {
    return this.reportService.getReport();
  }
}
