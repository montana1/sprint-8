import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as jwkToPem from 'jwk-to-pem';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class KeycloakService {
  private keycloakUrl = process.env.KEYCLOAK_URL;
  private realm = process.env.KEYCLOAK_REALM;

  async fetchPublicKey(): Promise<string> {
    const url = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/certs`;
    const response = await axios.get<{ keys: Array<jwkToPem.JWK & { use: string }> }>(url);
    const jwk = response.data.keys.find((key) => key.use === 'sig');
    const pem = this.createPem(jwk);
    return pem;
  }

  createPem(jwk: jwkToPem.JWK): string {
    return jwkToPem(jwk);
  }

  async validateToken(token: string) {
    try {
      const pem = await this.fetchPublicKey();
      const userInfo = jwt.verify(token, pem, { algorithms: ['RS256'] });
      return userInfo;
    } catch (error) {
      throw error;
    }
  }
}
