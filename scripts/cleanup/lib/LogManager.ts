/**
 * LogManager - إدارة سجلات الأداة
 * Log Manager for the cleanup tool
 */

import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

export class LogManager {
  private logs: LogEntry[] = [];
  private logFilePath: string;
  private consoleEnabled: boolean;

  constructor(logFilePath: string = 'cleanup.log', consoleEnabled: boolean = true) {
    this.logFilePath = logFilePath;
    this.consoleEnabled = consoleEnabled;
  }

  /**
   * إضافة سجل جديد
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    // طباعة للكونسول
    if (this.consoleEnabled) {
      this.printToConsole(entry);
    }

    // كتابة للملف
    this.writeToFile(entry);
  }

  /**
   * طباعة السجل للكونسول بألوان
   */
  private printToConsole(entry: LogEntry): void {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m',    // Cyan
      [LogLevel.INFO]: '\x1b[37m',     // White
      [LogLevel.WARN]: '\x1b[33m',     // Yellow
      [LogLevel.ERROR]: '\x1b[31m',    // Red
      [LogLevel.SUCCESS]: '\x1b[32m',  // Green
    };
    const reset = '\x1b[0m';

    const color = colors[entry.level];
    const prefix = `[${entry.timestamp}] [${entry.level}]`;

    console.log(`${color}${prefix}${reset} ${entry.message}`);
    if (entry.data) {
      console.log(JSON.stringify(entry.data, null, 2));
    }
  }

  /**
   * كتابة السجل للملف
   */
  private writeToFile(entry: LogEntry): void {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      appendFileSync(this.logFilePath, logLine);
    } catch (error) {
      // تجاهل أخطاء الكتابة للملف
    }
  }

  /**
   * مستويات السجل المختصرة
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  success(message: string, data?: any): void {
    this.log(LogLevel.SUCCESS, message, data);
  }

  /**
   * الحصول على جميع السجلات
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * الحصول على السجلات حسب المستوى
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * حفظ التقرير النهائي
   */
  saveReport(reportPath: string): void {
    const report = {
      generated_at: new Date().toISOString(),
      total_logs: this.logs.length,
      logs_by_level: {
        DEBUG: this.getLogsByLevel(LogLevel.DEBUG).length,
        INFO: this.getLogsByLevel(LogLevel.INFO).length,
        WARN: this.getLogsByLevel(LogLevel.WARN).length,
        ERROR: this.getLogsByLevel(LogLevel.ERROR).length,
        SUCCESS: this.getLogsByLevel(LogLevel.SUCCESS).length,
      },
      logs: this.logs,
    };

    writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }

  /**
   * مسح جميع السجلات
   */
  clear(): void {
    this.logs = [];
  }
}
