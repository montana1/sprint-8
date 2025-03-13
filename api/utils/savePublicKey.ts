import jwksClient from "jwks-rsa";
import fs from "fs";
import { env } from "./env.js";

const client = jwksClient({
  jwksUri: env.jwksUri!,
  requestHeaders: {}, // Optional
  timeout: 5000, // Defaults to 30s
});

export const savePublicKey = async () => {
  const key = await client.getSigningKey();
  const signingKey = key.getPublicKey();

  if (!signingKey) {
    throw new Error("Не удалось получить публичный ключ keycloak");
  }

  fs.mkdirSync("keys", { recursive: true });
  fs.writeFileSync(`${env.publicKeyDir}`, signingKey);
};
