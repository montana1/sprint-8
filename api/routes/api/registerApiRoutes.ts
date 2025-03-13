import { Router } from "express";
import type { Express } from "express";

import { registerApiReportRoutes } from "./report/registerApiReportRoutes.js";

export function registerApiRoutes(globalRouter: Router, app: Express): void {
  const apiRouter = Router();
  registerApiReportRoutes(apiRouter, app);

  globalRouter.use("/api", apiRouter);
}
