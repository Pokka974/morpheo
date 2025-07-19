import { Prisma, PrismaClient } from '.prisma/client';
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { logError, logInfo } from './logger.service';
const prisma = new PrismaClient();
dotenv.config();

const generateDallEImage = async (
    dreamDescription: string,
    dreamId: string,
    openai: OpenAI,
) => {
    // const systemPrompt = `A realitic style about ${dreamDescription}. The image should always represent the dream's subject even if it has a negative vibe, the colors should represents the emotions and the vibe the the dream reflects. The overall atmosphere should be dreamlike and soothing, with a sense of otherworldly beauty.`;
    try {
        // Check dream exists first
        const dream = await prisma.dream.findUniqueOrThrow({
            where: { id: dreamId },
        });

        if (!dream) {
            return null;
        }

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: dreamDescription,
            style: 'natural',
            user: dream.userId,
            n: 1,
            quality: 'standard',
            size: '1024x1024',
        });

        logInfo(JSON.stringify(response));

        const imageUrl = response.data?.[0]?.url;

        if (!imageUrl) {
            logError('No image URL');
            return new Error('No image URL');
        }

        return {
            ...(await prisma.$transaction([
                prisma.dream.update({
                    where: { id: dreamId },
                    data: {
                        dallEPrompt: dreamDescription,
                        dalleImagePath: response.data?.[0]?.url,
                    },
                }),
            ])),
            imageUrl,
        };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new Error(`Dream ${dreamId} not found in database`);
            }
        }
        throw error;
    }
};

export default {
    generateDallEImage,
};
