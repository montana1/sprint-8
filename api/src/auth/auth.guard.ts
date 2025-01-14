import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { KeycloakService } from '../keycloak/keycloak.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly keycloakService: KeycloakService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);
    const userInfo: any = await this.keycloakService.validateToken(token);
    return userInfo.realm_access.roles.includes('prothetic_user');
  }

  extractTokenFromRequest(request): string {
    const authHeader = request.headers.authorization as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Not authorized');
    }
    return authHeader.split(' ')[1];
  }
}
