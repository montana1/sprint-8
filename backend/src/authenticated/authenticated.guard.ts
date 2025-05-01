import {
  applyDecorators,
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { type Request } from 'express';
import { UserData } from 'src/constants';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const response = await fetch(
        `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new UnauthorizedException(
          'Invalid token or Keycloak unreachable',
        );
      }

      const userData = (await response.json()) as UserData;
      request.user = userData;

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      throw new UnauthorizedException('Invalid token or Keycloak unreachable');
    }
  }
}

export function Authenticated() {
  return applyDecorators(UseGuards(AuthenticatedGuard));
}
