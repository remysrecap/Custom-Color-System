// ===============================================
// Logging System
// ===============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  module?: string;
  operation?: string;
  details?: any;
}

export interface LoggerConfig {
  enableConsole: boolean;
  enableFile: boolean;
  minLevel: LogLevel;
  maxEntries: number;
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private isEnabled = true;

  private constructor(config: LoggerConfig) {
    this.config = config;
  }

  public static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config || {
        enableConsole: true,
        enableFile: false,
        minLevel: 'info',
        maxEntries: 1000
      });
    }
    return Logger.instance;
  }

  /**
   * Logs a message with the specified level
   */
  public log(
    level: LogLevel,
    message: string,
    module?: string,
    operation?: string,
    details?: any
  ): void {
    if (!this.isEnabled || !this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      module,
      operation,
      details
    };

    this.entries.push(entry);
    this.trimEntries();

    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
  }

  /**
   * Logs a debug message
   */
  public debug(message: string, module?: string, operation?: string, details?: any): void {
    this.log('debug', message, module, operation, details);
  }

  /**
   * Logs an info message
   */
  public info(message: string, module?: string, operation?: string, details?: any): void {
    this.log('info', message, module, operation, details);
  }

  /**
   * Logs a warning message
   */
  public warn(message: string, module?: string, operation?: string, details?: any): void {
    this.log('warn', message, module, operation, details);
  }

  /**
   * Logs an error message
   */
  public error(message: string, module?: string, operation?: string, details?: any): void {
    this.log('error', message, module, operation, details);
  }

  /**
   * Logs a success message
   */
  public success(message: string, module?: string, operation?: string, details?: any): void {
    this.log('success', message, module, operation, details);
  }

  /**
   * Gets all log entries
   */
  public getEntries(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Gets log entries filtered by level
   */
  public getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter(entry => entry.level === level);
  }

  /**
   * Gets log entries filtered by module
   */
  public getEntriesByModule(module: string): LogEntry[] {
    return this.entries.filter(entry => entry.module === module);
  }

  /**
   * Clears all log entries
   */
  public clear(): void {
    this.entries = [];
  }

  /**
   * Enables or disables logging
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Updates the logger configuration
   */
  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Exports logs as a formatted string
   */
  public exportLogs(): string {
    return this.entries
      .map(entry => this.formatLogEntry(entry))
      .join('\n');
  }

  /**
   * Checks if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'success'];
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Trims log entries to the maximum allowed
   */
  private trimEntries(): void {
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }
  }

  /**
   * Logs to console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry);
    const consoleMethod = this.getConsoleMethod(entry.level);
    consoleMethod(formatted);
  }

  /**
   * Gets the appropriate console method for the log level
   */
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
      case 'success':
        return console.log;
      default:
        return console.log;
    }
  }

  /**
   * Formats a log entry for display
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(7);
    const module = entry.module ? `[${entry.module}]` : '';
    const operation = entry.operation ? `(${entry.operation})` : '';
    const details = entry.details ? ` ${JSON.stringify(entry.details)}` : '';
    
    return `${timestamp} ${level} ${module}${operation} ${entry.message}${details}`;
  }
}

/**
 * Global logger instance
 */
export const logger = Logger.getInstance();

/**
 * Convenience functions for logging
 */
export const log = {
  debug: (message: string, module?: string, operation?: string, details?: any) => 
    logger.debug(message, module, operation, details),
  info: (message: string, module?: string, operation?: string, details?: any) => 
    logger.info(message, module, operation, details),
  warn: (message: string, module?: string, operation?: string, details?: any) => 
    logger.warn(message, module, operation, details),
  error: (message: string, module?: string, operation?: string, details?: any) => 
    logger.error(message, module, operation, details),
  success: (message: string, module?: string, operation?: string, details?: any) => 
    logger.success(message, module, operation, details)
};

/**
 * Performance timing utilities
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
    log.debug(`Timer started: ${name}`, 'performance');
  }

  public end(): number {
    const duration = performance.now() - this.startTime;
    log.debug(`Timer ended: ${this.name} (${duration.toFixed(2)}ms)`, 'performance');
    return duration;
  }
}

/**
 * Creates a performance timer
 */
export function startTimer(name: string): PerformanceTimer {
  return new PerformanceTimer(name);
}

/**
 * Measures the execution time of a function
 */
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const timer = startTimer(name);
  try {
    const result = await fn();
    timer.end();
    return result;
  } catch (error) {
    timer.end();
    throw error;
  }
}

/**
 * Measures the execution time of a sync function
 */
export function measureTimeSync<T>(
  name: string,
  fn: () => T
): T {
  const timer = startTimer(name);
  try {
    const result = fn();
    timer.end();
    return result;
  } catch (error) {
    timer.end();
    throw error;
  }
}
