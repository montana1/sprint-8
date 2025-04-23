import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { KeycloakService } from './keycloak.service';
import { KeycloakTokenPayload } from './types';


@Injectable()
export class KeycloakGuard implements CanActivate {
	constructor(
		private readonly keycloakService: KeycloakService,
		private readonly reflector: Reflector
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractToken(request);

		if (!token) {
			throw new UnauthorizedException('Отсутствует токен');
		}

		const payload = await this.keycloakService.validateToken(token);

		const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];

		if (requiredRoles.length > 0) {
			const clientId = process.env.KEYCLOAK_CLIENT_ID || 'reports-frontend';

			const realmRoles = payload ? payload.realm_access?.roles || [] : [];

			let clientRoles = payload ? payload?.resource_access?.[clientId]?.roles || [] : [];

			const userRoles = [...realmRoles, ...clientRoles];
			console.log('Вот какие роли на всех уровнях нашлись у пользователя: ', userRoles)

			if (!requiredRoles.some(role => userRoles.includes(role))) {
				throw new ForbiddenException(
					`Missing required roles: ${requiredRoles.join(', ')}. Your roles: ${userRoles.join(', ')}`
				);
			}
		}

		request.user = payload;
		return true;
	}

	private extractToken(request: Request): string | null {
		const authHeader = request.headers?.authorization;
		if (!authHeader) return null;

		const [type, token] = authHeader.split(' ');
		return type === 'Bearer' ? token : null;
	}
}