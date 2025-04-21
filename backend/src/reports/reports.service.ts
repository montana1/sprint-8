import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
	generateReport() {
		return {
			id: Math.random().toString(36).substring(7),
			date: new Date().toISOString(),
			metrics: {
				mkactivity: (Math.random() * 10000).toFixed(2),
				sessions: Math.floor(Math.random() * 5000),
				conversion: (Math.random() * 10).toFixed(2) + '%'
			},
			charts: [
				{ name: 'Traffic', data: this.generateRandomChartData() },
				{ name: 'Activity', data: this.generateRandomChartData() }
			]
		};
	}

	private generateRandomChartData() {
		return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
	}
}