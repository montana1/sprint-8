import type { Response } from "./types";

export function sendSuccess(
  res: Response,
  data: {} | any[] | boolean,
  statusCode = 200
): void {
  res.status(statusCode).send({
    data,
    success: true,
  });
}
