function format(entry) {
  const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : "";
  return `[${entry.ts}] [${entry.level.toUpperCase()}] ${entry.msg}${metaStr}`;
}

const logger = {
  info(msg, meta) {
    console.log(format({ ts: new Date().toISOString(), level: "info", msg, meta }));
  },
  warn(msg, meta) {
    console.warn(format({ ts: new Date().toISOString(), level: "warn", msg, meta }));
  },
  error(msg, meta) {
    console.error(format({ ts: new Date().toISOString(), level: "error", msg, meta }));
  },
};

module.exports = { logger };
