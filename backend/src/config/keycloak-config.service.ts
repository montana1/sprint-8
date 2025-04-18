import { Injectable } from '@nestjs/common';
import {
  KeycloakConnectOptions,
  KeycloakConnectOptionsFactory,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {
  createKeycloakConnectOptions(): KeycloakConnectOptions {

    console.log('process.env.KEYCLOAK_SERVER_URL', process.env.KEYCLOAK_SERVER_URL);
    return {
      authServerUrl: process.env.KEYCLOAK_SERVER_URL || 'http://127.0.0.1:8080',
      realm: process.env.KEYCLOAK_REALM || 'reports-realm',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'reports-api',
      secret: process.env.KEYCLOAK_CLIENT_SECRET || 'oNwoLQdvJAvRcL89SydqCWCe5ry1jMgq',
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.NONE,
    };
  }
}
