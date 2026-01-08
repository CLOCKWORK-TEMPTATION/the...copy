type LogLevel = "debug" | "info" | "warn" | "error";

class LoggerService {
    private static instance: LoggerService;
    private level: LogLevel;

    private constructor() {
        const isDev = process.env.NODE_ENV !== "production";
        this.level = isDev ? "debug" : "info";
    }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    private shouldLog(target: LogLevel): boolean {
        const order: Record<LogLevel, number> = {
            debug: 10,
            info: 20,
            warn: 30,
            error: 40,
        };

        return order[target] >= order[this.level];
    }

    public info(message: string, ...args: unknown[]): void {
        if (!this.shouldLog("info")) return;
        console.info(message, ...args);
    }

    public warn(message: string, ...args: unknown[]): void {
        if (!this.shouldLog("warn")) return;
        console.warn(message, ...args);
    }

    public error(message: string, ...args: unknown[]): void {
        if (!this.shouldLog("error")) return;
        console.error(message, ...args);
    }

    public debug(message: string, ...args: unknown[]): void {
        if (!this.shouldLog("debug")) return;
        console.debug(message, ...args);
    }

    public getRawLogger(): Console {
        return console;
    }
}

export const logger = LoggerService.getInstance();
export default LoggerService;
