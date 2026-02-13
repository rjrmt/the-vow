type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  ts: string;
  level: LogLevel;
  msg: string;
  meta?: Record<string, unknown>;
}

function format(entry: LogEntry): string {
  const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : "";
  return `[${entry.ts}] [${entry.level.toUpperCase()}] ${entry.msg}${metaStr}`;
}

export const logger = {
  info(msg: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level: "info",
      msg,
      meta,
    };
    console.log(format(entry));
  },
  warn(msg: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level: "warn",
      msg,
      meta,
    };
    console.warn(format(entry));
  },
  error(msg: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level: "error",
      msg,
      meta,
    };
    console.error(format(entry));
  },
};
