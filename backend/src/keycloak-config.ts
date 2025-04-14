import KeycloakConnect from 'keycloak-connect';

interface KeycloakConnectConfig {
    realm: string;
    'auth-server-url': string;
    'ssl-required': string;
    resource: string;
    'bearer-only': boolean;
    'confidential-port': number;
    credentials: {
      secret: string | undefined;
    };
  }
  
  const config: KeycloakConnectConfig = {
    realm: 'reports-realm',
    'auth-server-url': process.env.KEYCLOAK_URL || 'http://localhost:8080',
    'ssl-required': 'external',
    resource: 'reports-api',
    'bearer-only': true,
    'confidential-port': 0,
    credentials: {
      secret: process.env.KEYCLOAK_CLIENT_SECRET
    }
  };
  
  export const keycloak = new KeycloakConnect (
    {},
    config
  );