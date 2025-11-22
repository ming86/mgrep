import os from "node:os";
import path from "node:path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export function getLogDir(appName = "myapp") {
  const xdgState = process.env.XDG_STATE_HOME;
  if (xdgState) return path.join(xdgState, appName, "logs");

  // Default Linux/Mac: ~/.local/state/myapp/logs
  return path.join(os.homedir(), ".local", "state", appName, "logs");
}

const LOG_DIR = getLogDir("mgrep");

export function setupLogger() {
  const transport = new DailyRotateFile({
    dirname: LOG_DIR,
    filename: "%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "31d",
  });

  // Winston logger instance with timestamps + rotation
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(
        (info) =>
          `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`,
      ),
    ),
    transports: [transport],
  });

  const originalConsoleLog = console.log;
  console.log = (...args: unknown[]) => {
    logger.info(args.join(" ") as string);
    originalConsoleLog(...args);
  };

  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    logger.error(args.join(" ") as string);
    originalConsoleError(...args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    logger.warn(args.join(" ") as string);
    originalConsoleWarn(...args);
  };

  const originalConsoleDebug = console.debug;
  console.debug = (...args: unknown[]) => {
    logger.debug(args.join(" ") as string);
    originalConsoleDebug(...args);
  };

  const originalConsoleTrace = console.trace;
  console.trace = (...args: unknown[]) => {
    logger.error(args.join(" ") as string);
    originalConsoleTrace(...args);
  };

  return logger;
}
