import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { KeycloakTokenPayload } from "./types";

@Injectable()
export class KeycloakService {
	private readonly jwksUri: string;
	private readonly issuer: string;
	private readonly audience: string;
	private jwksClient: JwksClient;
	constructor() {
		this.jwksUri = process.env.KEYCLOAK_JWKS_URI ||
			`http://${process.env.KEYCLOAK_HOST || 'keycloak'}:${process.env.KEYCLOAK_PORT || '8080'}/realms/${process.env.KEYCLOAK_REALM || 'reports-realm'}/protocol/openid-connect/certs`;

		this.issuer = process.env.KEYCLOAK_ISSUER ||
			`http://${process.env.KEYCLOAK_HOST || 'localhost'}:${process.env.KEYCLOAK_PORT || '8080'}/realms/${process.env.KEYCLOAK_REALM || 'reports-realm'}`;

		this.audience = process.env.KEYCLOAK_AUDIENCE || 'reports-frontend';

		this.jwksClient = new JwksClient({
			jwksUri: this.jwksUri,
			timeout: parseInt(process.env.JWKS_TIMEOUT || '30000'),
			cache: process.env.JWKS_CACHE !== 'false',
			cacheMaxAge: parseInt(process.env.JWKS_CACHE_MAX_AGE || '5000'),
			jwksRequestsPerMinute: parseInt(process.env.JWKS_REQUESTS_PER_MINUTE || '10'),
		});
	}

	async validateToken(token: string | null) {
		if (!token) return false;

		try {
			const decoded = jwt.decode(token, { complete: true });
			if (!decoded || typeof decoded === 'string') {
				throw new Error('Invalid token format');
			}
			//
			// console.log('decoded.header:', decoded.header);
			// console.log('decoded.payload:', decoded.payload);

			if (!decoded?.header?.kid) return false;
			const key = await this.getKeyWithRetry(decoded.header.kid);
			const publicKey = key.getPublicKey();


			try {
				console.log('11 ==============>>>', key)
				return jwt.verify(token, publicKey, {
					algorithms: ['RS256'],
					issuer: this.issuer,
				}) as KeycloakTokenPayload;
			} catch (err) {
				console.error('Ошибка верификации токена:');

				if (err.name === 'TokenExpiredError') {
					console.error('Токен просрочен! Дата истечения:', err.expiredAt);
				} else if (err.name === 'JsonWebTokenError') {
					console.error('Некорректный токен:', err.message);
					if (err.message.includes('invalid signature')) {
						console.error('Неверная подпись токена');
					} else if (err.message.includes('jwt malformed')) {
						console.error('Некорректный формат токена');
					}
				} else if (err.name === 'NotBeforeError') {
					console.error('Токен еще не активен! Станет активен с:', err.date);
				} else {
					console.error('Неизвестная ошибка:', err);
				}
			}
		} catch (err) {
			console.error('Токен невалидный:', err.message);
			return false;
		}
	}

	private async getKeyWithRetry(kid: string, retries = 3): Promise<any> {
		try {
			return await this.jwksClient.getSigningKey(kid);
		} catch (err) {
			if (retries > 0) {
				console.log(`Попытка получить публичный ключ № (${retries} )...`);
				await new Promise(resolve => setTimeout(resolve, 1000));
				return this.getKeyWithRetry(kid, retries - 1);
			}
			throw new Error(`Все попытки считать публичный ключ провалились: ${err.message}`);
		}
	}
}