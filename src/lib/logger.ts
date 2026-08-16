
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

  private constructor() {
    this.requestId = crypto.randomUUID();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private sanitize(data: any): any {
    if (!data) return data;
    
    // Deep copy to avoid mutating original
    const sanitized = JSON.parse(JSON.stringify(data));
    
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'auth', 
      'credential', 'email', 'phone', 'cpf', 'cnpj'
    ];

    const wash = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          wash(obj[key]);
        } else if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          obj[key] = '[REDACTED]';
        }
      }
    };

    wash(sanitized);
    return sanitized;
  }

  private log(level: LogLevel, message: string, context: LogContext = {}, error?: Error) {
    const userId = localStorage.getItem('sb-bqxfopftcoagiautjeqz-auth-token') 
      ? JSON.parse(localStorage.getItem('sb-bqxfopftcoagiautjeqz-auth-token')!).user?.id 
      : undefined;

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

    // In a real production environment, we would send this to a logging service (Datadog, Loggly, etc.)
    // For now, we use structured console logs which are picked up by cloud collectors
    const logMethod = level === 'fatal' || level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    
    if (process.env.NODE_ENV === 'development') {
      console[logMethod](`[${level.toUpperCase()}] ${message}`, entry.context, error || '');
    } else {
      console[logMethod](JSON.stringify(entry));
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
