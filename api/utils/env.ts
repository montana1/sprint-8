import { config } from "dotenv";
import { resolve } from "node:path";

if (process.env["NODE_ENV"] !== "production") {
  config({
    path: resolve(process.cwd(), ".env"),
  });
}

export const env = {
  apiPort: process.env["API_PORT"],
  publicKeyDir: process.env["API_PUBLIC_KEY_DIR"],
  jwksUri: process.env["JWKS_URI"],
};
