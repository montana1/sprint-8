import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { KeycloakGuard } from "./auth/keycloak.guard";

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule, //это так-то KeycloakModule, но если я ещё раз переберу зависимости - у меня крыша поедет...
    ReportsModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: KeycloakGuard,
    },
  ],
})
export class AppModule {}