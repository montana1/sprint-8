import { logger } from "../logger/logger.js";
import { sendUnauthenticatedError } from "../utils/sendUnauthenticatedError.js";
import { verifyToken } from "../utils/verifyToken.js";
import type { RequestHandler } from "../utils/types";

export const authMiddleware: RequestHandler = async (_req, res, next) => {
  try {
    const user = await verifyToken(res.locals.token);

    if (!user) {
      return sendUnauthenticatedError(res);
    }

    res.locals.user = user;

    next();
  } catch (err) {
    logger.error(err);

    sendUnauthenticatedError(res);
  }
};
