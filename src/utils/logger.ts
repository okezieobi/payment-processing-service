export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
}

function writeLog(level: LogLevel, message: string, meta?: Record<string, any>) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta,
    };
    console.log(JSON.stringify(logEntry));
}

export const logger = {
    info: (msg: string, meta?: Record<string, any>) => writeLog(LogLevel.INFO, msg, meta),
    warn: (msg: string, meta?: Record<string, any>) => writeLog(LogLevel.WARN, msg, meta),
    error: (msg: string, meta?: Record<string, any>) => writeLog(LogLevel.ERROR, msg, meta),
    debug: (msg: string, meta?: Record<string, any>) => writeLog(LogLevel.DEBUG, msg, meta),
};