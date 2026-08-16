
type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  userId?: string;
  action?: string;
  requestId?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private static instance: Logger;
  private requestId: string;
  private metrics: Map<string, number> = new Map();

  private constructor() {
    this.requestId = this.generateId();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public startTimer(label: string) {
    try {
      this.metrics.set(label, performance.now());
    } catch (e) {
      // Ignore performance API errors
    }
  }

  public endTimer(label: string, context: LogContext = {}) {
    try {
      const start = this.metrics.get(label);
      if (start) {
        const duration = performance.now() - start;
        this.info(`Metric: ${label}`, { ...context, duration: `${duration.toFixed(2)}ms`, metricLabel: label });
        this.metrics.delete(label);
        return duration;
      }
    } catch (e) {
      // Ignore
    }
    return 0;
  }

  private sanitize(data: any): any {
    if (!data) return data;
    
    try {
      // Deep copy to avoid mutating original, using a safer approach
      const sanitized = JSON.parse(JSON.stringify(data));
      
      const sensitiveKeys = [
        'password', 'token', 'secret', 'key', 'auth', 
        'credential', 'email', 'phone', 'cpf', 'cnpj'
      ];

      const wash = (obj: any) => {
        for (const key in obj) {
          if (obj[key] && typeof obj[key] === 'object') {
            wash(obj[key]);
          } else if (typeof key === 'string' && sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            obj[key] = '[REDACTED]';
          }
        }
      };

      wash(sanitized);
      return sanitized;
    } catch (e) {
      return "[Unsanitizable Data]";
    }
  }

  private log(level: LogLevel, message: string, context: LogContext = {}, error?: Error) {
    let userId = undefined;
    try {
      const authKey = 'sb-bqxfopftcoagiautjeqz-auth-token';
      const stored = localStorage.getItem(authKey);
      if (stored) {
        userId = JSON.parse(stored).user?.id;
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitize({
        ...context,
        userId: context.userId || userId,
        requestId: this.requestId,
      }),
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }

    const logMethod = level === 'fatal' || level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console[logMethod](`[${level.toUpperCase()}] ${message}`, entry.context, error || '');
      } else {
        console[logMethod](JSON.stringify(entry));
      }
    } catch (e) {
      // Ultimate fallback if console fails or stringify fails
      console.error("Logger failed", level, message);
    }
  }

  public info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  public warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  public error(message: string, context?: LogContext, error?: Error) {
    this.log('error', message, context, error);
  }

  public fatal(message: string, context?: LogContext, error?: Error) {
    this.log('fatal', message, context, error);
  }
}

export const logger = Logger.getInstance();
