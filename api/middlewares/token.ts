import type { RequestHandler } from "../utils/types";

export const tokenMiddleware: RequestHandler = async (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  const token =
    typeof tokenHeader === "string" ? tokenHeader : tokenHeader?.[0];

  res.locals.token = token?.split("Bearer ")?.[1];

  next();
};
