import { sendError } from "./sendError.js";
import type { Response } from "./types";

export function sendUnauthenticatedError(res: Response): void {
  sendError(res, "Unauthenticated", 401);
}
