import pino, { Logger, LoggerOptions } from "pino";

/**
 * Singleton LoggerService using Pino.
 * Provides unified logging configuration for Development and Production.
 */
class LoggerService {
    private static instance: LoggerService;
    private logger: Logger;

    private constructor() {
        const isDev = process.env.NODE_ENV !== "production";

        const config: LoggerOptions = {
            level: isDev ? "debug" : "info",
            timestamp: pino.stdTimeFunctions.isoTime,
            browser: {
                asObject: true,
                serialize: true,
            },
            // In frontend/browser context, pino-pretty is often handled via browser-specific transport or just native console object formatting by pino-browser.
            // We keep it simple for now, using standard pino browser behavior which is very capable.
            // If running in Node context (SSR), transport would be used.
            transport:
                typeof window === "undefined" && isDev
                    ? {
                        target: "pino-pretty",
                        options: {
                            colorize: true,
                            translateTime: "SYS:standard",
                            ignore: "pid,hostname",
                        },
                    }
                    : undefined,
        };

        this.logger = pino(config);
    }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    public info(message: string, ...args: any[]): void {
        this.logger.info(message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this.logger.warn(message, ...args);
    }

    public error(message: string, ...args: any[]): void {
        this.logger.error(message, ...args);
    }

    public debug(message: string, ...args: any[]): void {
        this.logger.debug(message, ...args);
    }

    // Expose the raw pino logger if needed for advanced usage
    public getRawLogger(): Logger {
        return this.logger;
    }
}

export const logger = LoggerService.getInstance();
export default LoggerService;
