import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { Reflector } from "@nestjs/core";
import { ForbiddenException } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class KeycloakGuard implements CanActivate {
	constructor(
		private readonly keycloakService: KeycloakService,
		private readonly reflector: Reflector
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractToken(request);

		const isValid = await this.keycloakService.validateToken(token);
		if (!isValid) throw new ForbiddenException('Invalid token');

		const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
		if (requiredRoles.length > 0) {
			const decoded = await this.keycloakService.decodeToken(token);
			const userRoles = decoded.resource_access?.['reports-frontend']?.roles || [];

			if (!requiredRoles.some(role => userRoles.includes(role))) {
				throw new ForbiddenException(`Missing required roles: ${requiredRoles.join(', ')}`);
			}
		}

		return true;
	}

	private extractToken(request: Request): string | null {
		const authHeader = request.headers?.authorization;
		if (!authHeader) return null;

		const [type, token] = authHeader.split(' ');
		return type === 'Bearer' ? token : null;
	}
}