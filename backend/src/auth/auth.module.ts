import { Module } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { KeycloakGuard } from './keycloak.guard';

@Module({
	providers: [KeycloakService, KeycloakGuard],
	exports: [KeycloakService, KeycloakGuard],
})
export class AuthModule {}