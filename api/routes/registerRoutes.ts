import { Express, Router } from "express";

import { tokenMiddleware } from "../middlewares/token.js";

import { registerApiRoutes } from "./api/registerApiRoutes.js";

export async function registerRoutes(app: Express): Promise<Router> {
  const globalRouter = Router();

  app.use(tokenMiddleware);

  registerApiRoutes(globalRouter, app);

  app.use(globalRouter);

  return globalRouter;
}
