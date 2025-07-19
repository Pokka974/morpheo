import logger from '../utils/logger';

// ordered from the most to least important
export const logError = (message: string) => {
    logger.error(message);
};

export const logWarn = (message: string) => {
    logger.warn(message);
};

export const logInfo = (message: string) => {
    logger.info(message);
};

export const logVerbose = (message: string) => {
    logger.verbose(message);
};

export const logDebug = (message: string) => {
    logger.debug(message);
};

export const logSilly = (message: string) => {
    logger.silly(message);
};
