import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Authenticated } from './authenticated/authenticated.guard';
import { Permissions } from './permissions/permissions.guard';
import { PERMISSIONS } from './constants';
import { Response } from 'express';

@Controller('reports')
@Authenticated()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Permissions(PERMISSIONS.reports.view)
  generateCSVReport(@Res() res: Response) {
    const data = this.appService.generateCSVReport();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
    res.send(data);
  }
}
