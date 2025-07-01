// SAGE Integration - Logger Utility
// Provides structured logging for SAGE components

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: Error;
}

export class Logger {
  private component: string;
  private level: LogLevel;

  constructor(component: string, level: LogLevel = 'info') {
    this.component = component;
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex >= currentLevelIndex;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.component}]`;

    let formattedMessage = `${prefix} ${message}`;

    if (data) {
      formattedMessage += ` | Data: ${JSON.stringify(data)}`;
    }

    if (error) {
      formattedMessage += ` | Error: ${error.message}`;
      if (error.stack) {
        formattedMessage += `\nStack: ${error.stack}`;
      }
    }

    return formattedMessage;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: any, data?: any): void {
    if (this.shouldLog('error')) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.error(this.formatMessage('error', message, data, errorObj));
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  createChild(childComponent: string): Logger {
    return new Logger(`${this.component}:${childComponent}`, this.level);
  }
}
