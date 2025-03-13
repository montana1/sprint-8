import { logger } from "../../../logger/logger.js";
import { sendError } from "../../../utils/sendError.js";
import type { RequestHandler } from "../../../utils/types";
import { sendSuccess } from "../../../utils/sendSuccess.js";

export const getReportHandler: RequestHandler<{}> = async (req, res) => {
  try {
    sendSuccess(res, {
      report: {
        data: "123",
      },
    });
  } catch (err) {
    logger.error(err);

    sendError(res, err);
  }
};
