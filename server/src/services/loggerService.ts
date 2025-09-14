import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which logs to print
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

// Define different formats
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console(),
    // File transport for errors
    new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
    }),
    // File transport for all logs
    new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
    }),
];

// Create the logger
export const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
    exitOnError: false,
});

// Create a stream object with a 'write' function that will be used by morgan
export const morganStream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Log uncaught exceptions
logger.exceptions.handle(
    new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
    })
);

// Log unhandled promise rejections
logger.rejections.handle(
    new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'rejections.log'),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
    })
);

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
