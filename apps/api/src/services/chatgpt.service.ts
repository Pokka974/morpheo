import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { logError, logInfo } from './logger.service';
import { getPreviousDreamsContext, findSimilarDreams } from './dreamHistory.service';

const prisma = new PrismaClient();

// Zod schema for recurring dream analysis
const RecurringDreamAnalysisSchema = z.object({
    hasConnections: z.boolean(),
    connectedDreams: z.array(z.object({
        id: z.string(),
        title: z.string(),
        date: z.string(),
        connection: z.string(),
    })),
    patterns: z.array(z.string()),
    interpretation: z.string(),
});

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
                demographics.push(`gender: ${userProfile.gender.toLowerCase().replace('_', ' ')}`);
            }
            
            if (userProfile.ageRange) {
                // Map age ranges to more descriptive terms for better DALL-E understanding
                const ageMapping: { [key: string]: string } = {
                    'TEEN_13_17': 'teenage (around 15-16 years old)',
                    'YOUNG_ADULT_18_25': 'young adult (early twenties, around 22-23 years old)',
                    'ADULT_26_35': 'young adult (late twenties to early thirties, around 28-30 years old)',
                    'MIDDLE_AGED_36_50': 'middle-aged adult (late thirties to early forties, around 38-42 years old)',
                    'MATURE_51_65': 'mature adult (early fifties, around 52-55 years old)',
                    'SENIOR_65_PLUS': 'senior (around 65-70 years old)'
                };
                const ageDescription = ageMapping[userProfile.ageRange] || userProfile.ageRange.replace(/_/g, '-').toLowerCase();
                demographics.push(`age: ${ageDescription}`);
            }
            
            if (userProfile.culturalBackground && userProfile.culturalBackground.length > 0) {
                demographics.push(`cultural background: ${userProfile.culturalBackground.join(', ')}`);
            }
            
            if (userProfile.location) {
                demographics.push(`location: ${userProfile.location}`);
            }
            
            if (demographics.length > 0) {
                personalizationContext = `\n\nUser demographics for personalization: ${demographics.join('; ')}.`;
                if (userProfile.interpretationStyle) {
                    personalizationContext += ` Preferred interpretation style: ${userProfile.interpretationStyle.toLowerCase().replace('_', ' ')}.`;
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
                    CRITICAL: When generating the dall-e-prompt, if the dream involves people or the dreamer themselves, you MUST be very specific about age and appearance. Use the exact age descriptors from the user demographics (e.g., "young woman in her late twenties" not just "woman", "man in his early thirties" not just "man"). This ensures the generated image accurately represents the user's age group.
                    SAFETY REQUIREMENTS for dall-e-prompt: For nightmares or violent dreams, create symbolic and artistic interpretations instead of literal depictions. Transform violence into symbolic struggle, fighting into overcoming challenges, dangerous animals into majestic creatures in natural settings, and scary elements into mysterious or surreal imagery. Focus on the emotional essence rather than explicit content. Example: "fighting a grizzly bear" becomes "powerful majestic bear in natural forest setting, symbolic of inner strength and wilderness connection".
                    - "midjourney-prompt": A detailed prompt for generating a MidJourney image based on the dream. We should feel the emotions of the dream through the image.
                    ${previousDreamsContext.dreamCount > 0 ? `
                    - "recurring_dream_analysis" (OPTIONAL): Only include this field if you detect meaningful connections between the current dream and the user's previous dreams based on the context provided. This should be a JSON object with:
                        * "hasConnections": boolean indicating if meaningful patterns were found
                        * "connectedDreams": array of objects with "id", "title", "date", and "connection" describing specific related previous dreams (max 3)
                        * "patterns": array of strings describing recurring themes, emotions, or symbols
                        * "interpretation": string explaining what the recurring patterns might mean psychologically or emotionally
                    IMPORTANT: Only include recurring_dream_analysis if there are GENUINE, MEANINGFUL connections. Don't force connections where none exist. Look for shared emotions, similar themes, recurring symbols, or progressive patterns.` : ''}
                    Use a neutral, professional tone. Avoid markdown. Keep responses under 250 words.
                    If not a dream, return { "error": "invalid_dream" }${personalizationContext}${previousDreamsPrompt}
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

        // Add recurring dream analysis to response if present
        const dreamWithRecurringAnalysis = {
            ...dream,
            recurringDreamAnalysis: parsedCleanedResponse.recurring_dream_analysis || undefined,
        };

        return dreamWithRecurringAnalysis;
    } catch (error) {
        logError(error as string);
        throw error;
    }
}
