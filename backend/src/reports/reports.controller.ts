import { Controller, Get, UseGuards } from '@nestjs/common';
import { KeycloakGuard } from '../auth/keycloak.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(KeycloakGuard)
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) {}

	@Get()
	async getReport() {
		return this.reportsService.generateReport();
	}

	@Get('summary')
	async getSummary() {
		const report = await this.reportsService.generateReport();
		return {
			users: report.metrics.users,
			revenue: report.metrics.revenue
		};
	}
}