import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { logError, logInfo } from './logger.service';
import {
    getPreviousDreamsContext,
    findSimilarDreams,
} from './dreamHistory.service';

const prisma = new PrismaClient();
const GTP_MODEL = 'gpt-5-mini';

// Cache age mapping to avoid recreating on every call
const AGE_MAPPING: { [key: string]: string } = {
    TEEN_13_17: 'teenage (around 15-16 years old)',
    YOUNG_ADULT_18_25: 'young adult (early twenties, around 22-23 years old)',
    ADULT_26_35:
        'young adult (late twenties to early thirties, around 28-30 years old)',
    MIDDLE_AGED_36_50:
        'middle-aged adult (late thirties to early forties, around 38-42 years old)',
    MATURE_51_65: 'mature adult (early fifties, around 52-55 years old)',
    SENIOR_65_PLUS: 'senior (around 65-70 years old)',
};

// Zod schema for recurring dream analysis
const RecurringDreamAnalysisSchema = z.object({
    hasConnections: z.boolean(),
    connectedDreams: z.array(
        z.object({
            title: z.string(),
            date: z.string(),
            connection: z.string(),
        }),
    ),
    patterns: z.array(z.string()),
    interpretation: z.string(),
});

// Zod schema for response validation
const DreamAnalysisSchema = z.object({
    title: z.string(),
    summary: z.string(),
    emotions: z.array(z.string()).length(3),
    keywords: z.array(z.string()).min(4),
    cultural_references: z.record(z.string(), z.unknown()),
    advice: z.string(),
    emoji: z.string(),
    'dall-e-prompt': z.string(),
    'midjourney-prompt': z.string(),
    recurring_dream_analysis: RecurringDreamAnalysisSchema.optional(),
});

export async function analyzeDream(
    prompt: string,
    openai: OpenAI,
    userId: string,
) {
    try {
        // Get user profile for personalization and previous dreams context
        const [userProfile, previousDreamsContext] = await Promise.all([
            prisma.user.findUnique({
                where: { clerkUserId: userId },
            }),
            getPreviousDreamsContext(userId),
        ]);

        // Build personalization context
        let personalizationContext = '';
        if (userProfile) {
            const demographics = [];

            if (userProfile.gender) {
                demographics.push(
                    `gender: ${userProfile.gender
                        .toLowerCase()
                        .replace('_', ' ')}`,
                );
            }

            if (userProfile.ageRange) {
                // Map age ranges to more descriptive terms for better DALL-E understanding
                const ageDescription =
                    AGE_MAPPING[userProfile.ageRange] ||
                    userProfile.ageRange.replace(/_/g, '-').toLowerCase();
                demographics.push(`age: ${ageDescription}`);
            }

            if (
                userProfile.culturalBackground &&
                userProfile.culturalBackground.length > 0
            ) {
                demographics.push(
                    `cultural background: ${userProfile.culturalBackground.join(
                        ', ',
                    )}`,
                );
            }

            if (userProfile.location) {
                demographics.push(`location: ${userProfile.location}`);
            }

            if (demographics.length > 0) {
                personalizationContext = `\n\nUser demographics for personalization: ${demographics.join(
                    '; ',
                )}.`;
                if (userProfile.interpretationStyle) {
                    personalizationContext += ` Preferred interpretation style: ${userProfile.interpretationStyle
                        .toLowerCase()
                        .replace('_', ' ')}.`;
                }
                personalizationContext += ` IMPORTANT: When generating the dall-e-prompt, if the dream involves people or the dreamer themselves, be very specific about their appearance using the user's exact demographics above. Use descriptive terms like "young woman in her late twenties" or "man in his early thirties" rather than just age ranges.`;
            }
        }

        // Add previous dreams context if available
        let previousDreamsPrompt = '';
        if (previousDreamsContext.dreamCount > 0) {
            previousDreamsPrompt = `\n\n${previousDreamsContext.compactSummary}`;
        }

        // OpenAI request
        const gptResponse = await openai.chat.completions.create({
            model: GTP_MODEL,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `You are a dream interpretation expert. Analyze the dream and return JSON with:
                    - "title": Short dream title
                    - "summary": 3-4 sentence interpretation
                    - "emoji": Main emoji (e.g., 😨)
                    - "emotions": 3 top emotions with emoji (e.g., ["😨 fear", "🤔 curiosity"])
                    - "keywords": 4+ symbolic keywords (e.g., ["ocean", "falling"])
                    - "cultural_references": 2-3 cultures with meanings (e.g., {"Celtic 🍀": "Transformation"})
                    - "advice": Short practical tip
                    - "dall-e-prompt": Format: mood, quality, lens, source, description, subject, setting, purpose (ALWAYS IN ENGLISH)
                    - "midjourney-prompt": Detailed visual prompt evoking dream emotions${
                        previousDreamsContext.dreamCount > 0
                            ? `
                    - "recurring_dream_analysis" (optional): If meaningful connections to previous dreams exist:
                      * "hasConnections": boolean
                      * "connectedDreams": max 3 objects with "title", "date", "connection" (NO id field)
                      * "patterns": recurring themes/symbols
                      * "interpretation": psychological meaning of patterns`
                            : ''
                    }
                    Tone: neutral, professional. Avoid markdown. Safety: For violent dreams, use symbolic/artistic interpretations.
                    IMPORTANT: Return ALL data in the same language as the input dream. EXCEPT "dall-e-prompt" which MUST ALWAYS be in English.${personalizationContext}${previousDreamsPrompt}`,
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
                culturalReferences: JSON.parse(
                    JSON.stringify(parsedCleanedResponse.cultural_references),
                ),
                advice: parsedCleanedResponse.advice,
                dallEPrompt: parsedCleanedResponse['dall-e-prompt'],
                midjourneyPrompt: parsedCleanedResponse['midjourney-prompt'],
                userId,
            },
        });

        // Process recurring dream analysis if present - match AI-identified titles to actual dream IDs
        let recurringAnalysisWithIds = undefined;
        if (parsedCleanedResponse.recurring_dream_analysis?.hasConnections) {
            const recurringAnalysis =
                parsedCleanedResponse.recurring_dream_analysis;

            // Build a map of dream titles to IDs from previousDreamsContext for O(1) lookup
            const titleToIdMap = new Map<string, string>();
            for (const dream of previousDreamsContext.summaries) {
                titleToIdMap.set(dream.title.toLowerCase(), dream.id);
            }

            // Match AI-identified dream titles to actual dream IDs using the pre-built map
            const connectedDreamsWithIds = recurringAnalysis.connectedDreams
                .map((aiDream) => {
                    const id = titleToIdMap.get(aiDream.title.toLowerCase());
                    return id ? { ...aiDream, id } : null;
                })
                .filter(
                    (
                        dream,
                    ): dream is (typeof recurringAnalysis.connectedDreams)[number] & {
                        id: string;
                    } => dream !== null,
                );

            // Only include if we successfully matched at least one dream
            if (connectedDreamsWithIds.length > 0) {
                recurringAnalysisWithIds = {
                    ...recurringAnalysis,
                    connectedDreams: connectedDreamsWithIds,
                };
            }
        }

        // Add recurring dream analysis to response if present
        const dreamWithRecurringAnalysis = {
            ...dream,
            recurringDreamAnalysis: recurringAnalysisWithIds || undefined,
        };

        return dreamWithRecurringAnalysis;
    } catch (error) {
        logError(error as string);
        throw error;
    }
}

export async function isPromptSafe(prompt: string, openai: OpenAI) {
    try {
        const response = await openai.moderations.create({
            input: prompt,
        });

        const results = response.results[0];
        return !results.flagged;
    } catch (error) {
        logError(`Moderation check failed: ${error}`);
        throw new Error('Moderation check failed');
    }
}
