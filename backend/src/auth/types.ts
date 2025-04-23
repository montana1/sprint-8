import * as jwt from 'jsonwebtoken';
export interface KeycloakTokenPayload extends jwt.JwtPayload {
	resource_access?: {
		[clientId: string]: {
			roles: string[];
		};
	};
	email?: string;
	preferred_username?: string;
	given_name?: string;
	family_name?: string;
	realm_access?: {
		roles: string[];
	};
}