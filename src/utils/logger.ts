import { invoke } from '@tauri-apps/api/core';

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

interface LogOptions {
  context?: string;
  data?: unknown;
}

class Logger {
  private async log(level: LogLevel, message: string, options?: LogOptions) {
    const context = options?.context || '';
    const fullMessage = options?.data
      ? `${message} | Data: ${JSON.stringify(options.data)}`
      : message;

    // 输出到控制台
    const consoleMethod = level === 'trace' ? 'log' : level;
    console[consoleMethod](`[${level.toUpperCase()}] ${context ? `[${context}] ` : ''}${fullMessage}`);

    // 发送到后端日志文件
    try {
      await invoke('log_from_frontend', {
        level,
        message: fullMessage,
        context: context || null,
      });
    } catch (error) {
      console.error('Failed to send log to backend:', error);
    }
  }

  error(message: string, options?: LogOptions) {
    return this.log('error', message, options);
  }

  warn(message: string, options?: LogOptions) {
    return this.log('warn', message, options);
  }

  info(message: string, options?: LogOptions) {
    return this.log('info', message, options);
  }

  debug(message: string, options?: LogOptions) {
    return this.log('debug', message, options);
  }

  trace(message: string, options?: LogOptions) {
    return this.log('trace', message, options);
  }
}

export const logger = new Logger();
