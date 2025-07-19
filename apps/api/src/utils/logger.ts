import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf, prettyPrint, colorize } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
    level: 'info',
    transports: [
        new transports.Console(),
        new transports.File({
            filename: './logs/winston/error.log',
            level: 'error',
        }),
        new transports.File({ filename: './logs/winston/combined.log' }),
    ],
    format: combine(
        label({ label: 'DeepDreamer API' }),
        timestamp(),
        prettyPrint(),
        colorize(),
        customFormat,
    ),
});

export default logger;
