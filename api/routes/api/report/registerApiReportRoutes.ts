import { Router } from "express";
import type { Express } from "express";

import { authMiddleware } from "../../../middlewares/auth.js";
import { roleMiddleware } from "../../../middlewares/role.js";
import { getReportHandler } from "./getReportHandler.js";

export function registerApiReportRoutes(
  apiRouter: Router,
  _app: Express
): void {
  const reportRouter = Router();

  reportRouter.get("/", getReportHandler);

  apiRouter.use("/report", authMiddleware, roleMiddleware, reportRouter);
}
