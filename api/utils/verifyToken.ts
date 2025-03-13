import jwt from "jsonwebtoken";

import { logger } from "../logger/logger.js";
import { getPublicKey } from "./getPublicKey.js";
import type { JWTUser } from "./types";

export async function verifyToken(token: string | undefined) {
  try {
    if (!token) {
      return undefined;
    }

    const publicKey = getPublicKey();

    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as Partial<JWTUser>;
  } catch (err) {
    logger.error(err);

    return undefined;
  }
}
