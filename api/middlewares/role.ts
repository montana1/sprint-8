import { logger } from "../logger/logger.js";
import { sendUnauthenticatedError } from "../utils/sendUnauthenticatedError.js";
import type { RequestHandler } from "../utils/types";
import { decodeToken } from "../utils/decodeToken.js";
import { sendUnauthorizedError } from "../utils/sendUnauthorizedError.js";

export const roleMiddleware: RequestHandler = async (_req, res, next) => {
  try {
    const user = await decodeToken(res.locals.token);

    if (!user?.realm_access?.roles?.includes("prothetic_user")) {
      return sendUnauthorizedError(res);
    }

    next();
  } catch (err) {
    logger.error(err);

    sendUnauthenticatedError(res);
  }
};
