import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import OpenAI from 'openai';
import dallEService from '../services/dallE.service';
import { logError, logInfo } from '../services/logger.service';

const openai: OpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateDallEImage = async (req: Request, res: Response) => {
    if (!openai) {
        logError('Invalid OpenAI Token');
        res.status(StatusCodes.UNAUTHORIZED).send('Invalid OpenAI Token');
    }

    try {
        const { dreamDescription, dreamId } = req.body;
        const dallERes = await dallEService.generateDallEImage(
            dreamDescription,
            dreamId,
            openai,
        );

        if (dallERes) {
            logInfo(`New dream image generated: ${JSON.stringify(dallERes)}`);
            res.status(StatusCodes.OK).json(dallERes);
        }
    } catch (error) {
        logError(error as string);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
            'An error occurred while processing your request.',
        );
    }
};

export default {
    generateDallEImage,
};
