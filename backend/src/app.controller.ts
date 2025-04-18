import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  AuthenticatedUser,
  Public,
  Roles,
  RoleMatchingMode,
} from 'nest-keycloak-connect';


@Controller()
export class AppController {
  @Get('init')
  @Public()
  init(): object {
    return {
      message: 'Get Token!',
    };
  }

  @Get()
  @Public(false)
  getHello(
    @AuthenticatedUser()
    user: any,
  ): string {
    if (user) {
      return `Hello ${user.preferred_username}`;
    } else {
      return 'Hello world!';
    }
  }

  @Get('private')
  getPrivate() {
    return 'Authenticated only!';
  }

  @Get('user/current')
  currentUser(
    @AuthenticatedUser()
    user: any,
  ) {
    console.warn('user ->', user);
    return user;
  }

  @Get('admin')
  @Roles({ roles: ['admin'], mode: RoleMatchingMode.ALL })
  adminRole() {
    return 'Admin only!';
  }

  @Get('reports')
  @Roles({ roles: ['realm:prothetic_user'], mode: RoleMatchingMode.ANY })
  getReports() {
    return [
      {
        id: 1,
        name: 'Report 1',
      },
      {
        id: 2,
        name: 'Report 2',
      },
    ];
  }
}
