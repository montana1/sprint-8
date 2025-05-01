import {
  applyDecorators,
  UseGuards,
  Injectable,
  type ExecutionContext,
  type CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { type Request } from 'express';
import { AuthenticatedGuard } from '../authenticated/authenticated.guard';
import { Permission, UserData } from '../constants';

export const PermissionsMetadata = Reflector.createDecorator<Permission[]>();

@Injectable()
class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userData = request.user as UserData;

    const requiredPermissions = this.reflector.get(
      PermissionsMetadata,
      context.getHandler(),
    );

    if (requiredPermissions.length === 0) {
      return true;
    }

    const userPermissions = userData.realm_access.roles;

    if (!userPermissions) {
      return false;
    }

    const isAnyPermissionSatisfied = requiredPermissions.some(
      (requiredPermission) => userPermissions.includes(requiredPermission),
    );

    return isAnyPermissionSatisfied;
  }
}

export function Permissions(...permissions: Permission[]) {
  return applyDecorators(
    PermissionsMetadata(permissions),
    UseGuards(AuthenticatedGuard, PermissionsGuard),
  );
}
