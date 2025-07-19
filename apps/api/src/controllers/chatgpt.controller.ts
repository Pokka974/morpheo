import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import OpenAI from 'openai';
import { logError } from '../services/logger.service';
import { getAuth } from '@clerk/express';
import { analyzeDream } from '../services/chatgpt.service';
import { checkRateLimit } from '../utils/rateLimiter';

const openai: OpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const createChatGptCompletion = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            logError('Unable to find related user');
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send('Unable to find related user');
        }

        const { remaining, limit, reset } = await checkRateLimit(userId);

        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', reset.toISOString());

        if (!openai) {
            logError('Invalid OpenAI Token');
            res.status(StatusCodes.UNAUTHORIZED).send('Invalid OpenAI Token');
        }

        const { prompt } = req.body;

        console.log(prompt);

        if (!prompt) {
            logError('Prompt is missing');
            res.status(StatusCodes.BAD_REQUEST).send('Prompt is missing');
        }

        const result = await analyzeDream(prompt, openai, userId);
        console.log(result);

        res.status(StatusCodes.OK).json(result);
    } catch (err: any) {
        if (err.message.includes('Plan limit exceeded')) {
            return res.status(429).json({
                error: err.message,
                upgradeUrl: '/upgrade',
            });
        }

        res.status(500).write(
            `data: ${JSON.stringify({ error: err.message })}\n\n`,
        );
        res.end();
    }
};

export default {
    createChatGptCompletion,
};
