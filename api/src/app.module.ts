import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  KeycloakConnectModule,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

@Module({
  imports: [
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
      realm: process.env.KEYCLOAK_REALM || 'reports-realm',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'reports-api',
      secret: process.env.KEYCLOAK_SECRET || 'oNwoLQdvJAvRcL89SydqCWCe5ry1jMgq',
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE, // optional
      tokenValidation: TokenValidation.ONLINE, // optional,
      logLevels: ['error', 'warn', 'debug', 'verbose', 'fatal'],
      useNestLogger: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
