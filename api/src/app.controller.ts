import { Controller, Get, StreamableFile, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard, RoleGuard, Roles } from 'nest-keycloak-connect';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('reports')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles({ roles: ['realm:prothetic_user'] })
  getReports(): StreamableFile {
    return new StreamableFile(this.appService.getReport(), {
      type: 'text/plain',
      disposition: 'attachment; filename="report.txt"',
    });
  }
}
