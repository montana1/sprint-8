import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

import { logger } from "../logger/logger.js";
import { registerRoutes } from "../routes/registerRoutes.js";
import { env } from "../utils/env.js";
import { savePublicKey } from "../utils/savePublicKey.js";

export async function initializeApp() {
  try {
    const app = express();

    app.use((await import("compression")).default());
    app.use(cors({ origin: true, credentials: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());

    await registerRoutes(app);
    await savePublicKey();

    await app.listen(Number(env.apiPort), "0.0.0.0");

    logger.info(`App is running at: http://localhost:${env.apiPort}`);
  } catch (err) {
    logger.error(err);
  }
}
