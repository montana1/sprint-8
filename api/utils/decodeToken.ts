import jwt from "jsonwebtoken";

import { logger } from "../logger/logger.js";
import type { JWTUser } from "./types";

export async function decodeToken(token: string | undefined) {
  try {
    if (!token) {
      return undefined;
    }

    const decodedToken = jwt.decode(token, {
      json: true,
    });

    return decodedToken as Partial<JWTUser>;
  } catch (err) {
    logger.error(err);

    return undefined;
  }
}
