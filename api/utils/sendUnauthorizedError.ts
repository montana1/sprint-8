import { sendError } from "./sendError.js";
import type { Response } from "./types";

export function sendUnauthorizedError(res: Response): void {
  sendError(res, "Unauthorized", 403);
}
