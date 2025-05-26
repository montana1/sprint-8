import { Module } from "@nestjs/common";
import {
  AuthGuard,
  KeycloakConnectModule,
  PolicyEnforcementMode,
  ResourceGuard,
  RoleGuard,
} from "nest-keycloak-connect";
import { ReportsController } from "./reports.controller";
import { APP_GUARD } from "@nestjs/core";

@Module({
  imports: [
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      logLevels: ['verbose'],
      useNestLogger: true,
    }),
  ],
  controllers: [ReportsController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
