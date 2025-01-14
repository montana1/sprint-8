import { Module } from '@nestjs/common';
import { KeycloakModule } from '../keycloak/keycloak.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [KeycloakModule],
  providers: [AuthGuard],
})
export class AuthModule {}
