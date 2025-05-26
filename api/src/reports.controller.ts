import { Controller, Get, Req } from "@nestjs/common";
import { RoleMatchingMode, Roles } from "nest-keycloak-connect";

@Controller("reports")
export class ReportsController {
  @Get()
  @Roles({ roles: ['realm:prothetic_user'], mode: RoleMatchingMode.ANY })
  getReports(@Req() request: any) {
    const reports = [
      {
        id: 1,
        title: "Ежемесячный отчет",
        date: new Date().toISOString(),
        data: { foo: "bar" },
      },
    ];

    return {
      reports,
      user: request.user,
    };
  }
}
