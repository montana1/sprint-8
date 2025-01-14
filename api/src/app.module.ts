import { Module } from '@nestjs/common';

import { ReportsModule } from './reports/reports.module';
import { KeycloakService } from './keycloak/keycloak.service';
import { AuthModule } from './auth/auth.module';
import { KeycloakModule } from './keycloak/keycloak.module';

@Module({
  imports: [ReportsModule, AuthModule, KeycloakModule],
  controllers: [],
  providers: [KeycloakService],
})
export class AppModule {}
