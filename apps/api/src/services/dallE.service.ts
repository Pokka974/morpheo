import { Prisma, PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { logError, logInfo } from './logger.service';
const prisma = new PrismaClient();
dotenv.config();

// Safety filter for DALL-E prompts - converts unsafe content to symbolic alternatives
const sanitizeDallEPrompt = (prompt: string): string => {
    let sanitizedPrompt = prompt;

    // Define safety transformations that preserve dream meaning while making content safe
    const safetyTransformations = [
        // Violence and fighting
        {
            unsafe: /fighting|battle|combat|attack|violence|violent/gi,
            safe: 'overcoming challenges',
        },
        {
            unsafe: /killing|murder|death|dying|dead/gi,
            safe: 'transformation and renewal',
        },
        { unsafe: /blood|bloody|bleeding/gi, safe: 'life force and vitality' },
        {
            unsafe: /weapon|gun|knife|sword|blade/gi,
            safe: 'tools of protection',
        },
        { unsafe: /war|warfare|conflict/gi, safe: 'inner struggle' },

        // Dangerous animals - make them symbolic
        {
            unsafe: /grizzly bear|bear attack|dangerous bear/gi,
            safe: 'powerful majestic bear in natural habitat',
        },
        {
            unsafe: /wild animal attack|animal attacking|wild animals/gi,
            safe: 'wild animal encounter',
        },
        { unsafe: /predator|predatory/gi, safe: 'guardian animal' },

        // Scary/nightmare elements
        {
            unsafe: /nightmare|terror|horrifying|terrifying/gi,
            safe: 'mysterious and surreal',
        },
        { unsafe: /demon|devil|evil spirit/gi, safe: 'shadow figure' },
        { unsafe: /monster|creature from hell/gi, safe: 'mythical being' },

        // Self-harm or injury
        {
            unsafe: /injury|injured|hurt|pain|suffering/gi,
            safe: 'healing and recovery',
        },
        { unsafe: /accident|crash|collision/gi, safe: 'unexpected change' },

        // Replace explicit emotional trauma with symbolic representation
        {
            unsafe: /trauma|traumatic|devastating/gi,
            safe: 'profound emotional experience',
        },
        {
            unsafe: /fear|scared|afraid|frightened/gi,
            safe: 'cautious and alert',
        },

        // Convert negative endings to neutral/symbolic ones
        {
            unsafe: /escape|escaping|running away/gi,
            safe: 'journey and movement',
        },
        { unsafe: /trapped|stuck|imprisoned/gi, safe: 'seeking freedom' },
    ];

    // Apply transformations
    safetyTransformations.forEach(({ unsafe, safe }) => {
        sanitizedPrompt = sanitizedPrompt.replace(unsafe, safe);
    });

    // Add positive framing words to encourage safe imagery
    if (
        sanitizedPrompt.includes('overcoming challenges') ||
        sanitizedPrompt.includes('transformation') ||
        sanitizedPrompt.includes('inner struggle')
    ) {
        sanitizedPrompt +=
            ', symbolic representation, artistic interpretation, dreamlike atmosphere';
    }

    // Log the transformation if changes were made
    if (sanitizedPrompt !== prompt) {
        logInfo(
            `DALL-E prompt sanitized. Original: "${prompt.substring(
                0,
                100,
            )}..." -> Sanitized: "${sanitizedPrompt.substring(0, 100)}..."`,
        );
    }

    return sanitizedPrompt;
};

const downloadImageAsBase64 = async (imageUrl: string): Promise<string> => {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/png';

        // Return data URI format
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        logError(`Error downloading image: ${error}`);
        throw error;
    }
};

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

        // Sanitize the prompt for DALL-E safety compliance
        const originalPrompt = dream.dallEPrompt || dreamDescription;
        const safePrompt = sanitizeDallEPrompt(originalPrompt);

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: safePrompt,
            style: 'natural',
            user: dream.userId,
            n: 1,
            quality: 'hd',
            size: '1024x1024',
        });

        logInfo(`DALL-E Response: ${JSON.stringify(response.data)}`);

        const imageUrl = response.data?.[0]?.url;

        if (!imageUrl) {
            logError('No image URL');
            return new Error('No image URL');
        }

        // Download the image and convert to base64
        logInfo('Downloading image for permanent storage...');
        const imageBase64 = await downloadImageAsBase64(imageUrl);
        logInfo(`Image converted to base64 successfully)`);

        const updatedDream = await prisma.$transaction([
            prisma.dream.update({
                where: { id: dreamId },
                data: {
                    dalleImagePath: imageUrl, // Keep original URL as backup
                    dalleImageData: imageBase64, // Store base64 for permanent access
                },
            }),
        ]);

        return {
            ...updatedDream,
            imageUrl,
            imageBase64,
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

// Export for testing
export { sanitizeDallEPrompt };
