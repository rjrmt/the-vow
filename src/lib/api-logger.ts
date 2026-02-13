import { logger } from "./logger";

export function withApiLogging<T>(
  handler: () => Promise<T>,
  meta: { route: string; method?: string }
): Promise<T> {
  const start = Date.now();
  logger.info(`API ${meta.method ?? "GET"} ${meta.route}`, { ...meta });
  return handler()
    .then((result) => {
      logger.info(`API ${meta.route} completed`, {
        ...meta,
        durationMs: Date.now() - start,
      });
      return result;
    })
    .catch((err) => {
      logger.error(`API ${meta.route} failed`, {
        ...meta,
        durationMs: Date.now() - start,
        error: err?.message,
      });
      throw err;
    });
}
