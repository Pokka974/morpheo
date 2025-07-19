import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { logError, logInfo } from './logger.service';

const prisma = new PrismaClient();

// Zod schema for response validation
const DreamAnalysisSchema = z.object({
    title: z.string(),
    summary: z.string(),
    emotions: z.array(z.string()).length(3),
    keywords: z.array(z.string()).min(4),
    cultural_references: z.record(z.string()),
    advice: z.string(),
    emoji: z.string(),
    'dall-e-prompt': z.string(),
    'midjourney-prompt': z.string(),
});

export async function analyzeDream(
    prompt: string,
    openai: OpenAI,
    userId: string,
) {
    try {
        // OpenAI request
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-4.1',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: ` You are a dream interpretation expert. Analyze the user's dream and return a JSON object with:
                    - "title": A short title for the dream.
                    - "summary": A 3-4 sentence interpretation.
                    - "emoji": the emoji that represent the dream the most (e.g., 😨)
                    - "emotions": A list of top 3 emotions detected with related emoji (e.g., ["😨 fear", "🤔 curiosity", "😕 confusion"]).
                    - "keywords": A list of at least 4 symbolic keywords (e.g., ["ocean", "falling", "darkness"]).
                    - "cultural_references": Symbolic meanings from 2-3 cultures (e.g., {
                            "Celtic 🍀": "Forests are often seen as places of transformation and mystery.",
                            "Greek 🏛️": "Mirrors can represent a portal to self-realization, as seen in the myth of Narcissus.",
                            "Native American 🛕": "Trees are considered sacred, representing life and wisdom."
                        }).
                    - "advice": A short tip for the user based on the dream.
                    - "dall-e-prompt": A dall-e prompt that must follow this format: "mood, quality, lens, source, description, subject, setting, purpose, desination"; 
                    example if the user dreamt about flying in the sky: 
                    "Euphoric and serene, high-quality, photorealistic, 4k cinematic lens, inspired by surrealist art, flying in the sky, a person flying gracefully, above the clouds, vivid sunset, evoke awe and inspiration, art showcase or personal visual journal."
                    - "midjourney-prompt": A detailed prompt for generating a MidJourney image based on the dream. We should feel the emotions of the dream through the image.
                    Use a neutral, professional tone. Avoid markdown. Keep responses under 200 words.
                    If not a dream, return { "error": "invalid_dream" }
                    `,
                },
                { role: 'user', content: prompt },
            ],
        });

        logInfo(JSON.stringify(gptResponse));

        // Validate response
        const responseText = gptResponse.choices[0].message.content;

        if (!responseText) {
            throw new Error('Invalid response from OpenAI');
        }

        const parsedResponse = JSON.parse(responseText);

        const parsedCleanedResponse = DreamAnalysisSchema.parse(parsedResponse);

        logInfo(JSON.stringify(parsedCleanedResponse));

        if (!parsedCleanedResponse) {
            throw new Error('Invalid JSON format response from AI');
        }

        // Save to database
        const dream = await prisma.dream.create({
            data: {
                description: prompt,
                title: parsedCleanedResponse.title,
                summary: parsedCleanedResponse.summary,
                emotions: parsedCleanedResponse.emotions,
                emoji: parsedCleanedResponse.emoji,
                keywords: parsedCleanedResponse.keywords,
                culturalReferences: parsedCleanedResponse.cultural_references,
                advice: parsedCleanedResponse.advice,
                dallEPrompt: parsedCleanedResponse['dall-e-prompt'],
                midjourneyPrompt: parsedCleanedResponse['midjourney-prompt'],
                userId,
            },
        });

        return dream;
    } catch (error) {
        logError(error as string);
        throw error;
    }
}
