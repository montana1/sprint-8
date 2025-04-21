import { Injectable } from '@nestjs/common';
const KeycloakConnect = require('keycloak-connect');
@Injectable()
export class KeycloakService {
	private readonly keycloak: any;

	constructor() {
		this.keycloak = new KeycloakConnect(
			{},
			{
				realm: process.env.KEYCLOAK_REALM,
				'auth-server-url': process.env.KEYCLOAK_URL,
				'ssl-required': 'external',
				resource: process.env.KEYCLOAK_CLIENT_ID,
				'confidential-port': 0,
				'enable-pkce': true
			}
		);
	}

	async decodeToken(token: string | null): Promise<any> {
		return KeycloakConnect.decode(token);
	}

	async validateToken(token: string | null): Promise<boolean> {
		if (!token) return false;

		try {
			const result = await this.keycloak.grantManager.validateToken(token);
			return !!result;
		} catch (e) {
			return false;
		}
	}
}