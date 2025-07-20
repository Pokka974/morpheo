import { PrismaClient } from '@prisma/client';
import { getPreviousDreamsContext, findSimilarDreams } from './dreamHistory.service';

const prisma = new PrismaClient();

export const updateDreamImageURL = async (
    dalleImagePath: string,
    dreamId: string,
) => {
    const prismaResult = await prisma.dream.update({
        where: { id: dreamId },
        data: { dalleImagePath },
    });

    return prismaResult;
};

export const getAllDreams = async (userId: string) => {
    const dreams = await prisma.dream.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    // Return pure dream data without any recurring analysis for performance
    // Recurring analysis will only be computed when viewing individual dreams
    return dreams;
};

export const getDreamById = async (userId: string, dreamId: string) => {
    const dream = await prisma.dream.findFirst({
        where: { id: dreamId, userId },
    });

    if (!dream) {
        return null;
    }

    // Add recurring dream analysis
    const dreamWithRecurringAnalysis = await addRecurringAnalysis(dream, userId);
    return dreamWithRecurringAnalysis;
};

export const generateRecurringAnalysisForDream = async (dream: any, userId: string) => {
    try {
        // Get previous dreams context (excluding current dream)
        const previousDreamsContext = await getPreviousDreamsContext(userId, dream.id);
        
        if (previousDreamsContext.dreamCount === 0) {
            return null; // No previous dreams to compare with
        }

        // Find similar dreams based on keywords and emotions
        const similarDreams = findSimilarDreams(
            dream.keywords,
            dream.emotions,
            previousDreamsContext.summaries,
            0.2 // Lower threshold for broader connections
        );

        if (similarDreams.length === 0) {
            return null; // No similar dreams found
        }

        // Extract patterns from similar dreams
        const allKeywords = [
            ...dream.keywords,
            ...similarDreams.flatMap(sd => sd.dream.keywords)
        ];
        const allEmotions = [
            ...dream.emotions,
            ...similarDreams.flatMap(sd => sd.dream.emotions)
        ];

        // Find recurring patterns
        const keywordFrequency: { [key: string]: number } = {};
        const emotionFrequency: { [key: string]: number } = {};

        allKeywords.forEach(keyword => {
            keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
        });

        allEmotions.forEach(emotion => {
            const cleanEmotion = emotion.replace(/[^\w\s]/gi, '').trim().toLowerCase();
            emotionFrequency[cleanEmotion] = (emotionFrequency[cleanEmotion] || 0) + 1;
        });

        // Get recurring patterns (appearing 2+ times)
        const recurringKeywords = Object.entries(keywordFrequency)
            .filter(([, count]) => count >= 2)
            .map(([keyword]) => keyword);

        const recurringEmotions = Object.entries(emotionFrequency)
            .filter(([, count]) => count >= 2)
            .map(([emotion]) => emotion);

        const patterns = [
            ...recurringKeywords.map(k => `recurring ${k} theme`),
            ...recurringEmotions.map(e => `repeated ${e} feelings`)
        ];

        // Generate interpretation
        const interpretation = generateRecurringInterpretation(patterns, similarDreams);

        return {
            hasConnections: true,
            connectedDreams: similarDreams.map(sd => ({
                id: sd.dream.id,
                title: sd.dream.title,
                date: new Date(sd.dream.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                connection: sd.connections.join(', ')
            })),
            patterns: patterns.slice(0, 5), // Limit to top 5 patterns
            interpretation
        };
    } catch (error) {
        console.error('Error generating recurring analysis:', error);
        return null;
    }
};

const generateRecurringInterpretation = (patterns: string[], similarDreams: any[]) => {
    if (patterns.length === 0) {
        return "This dream shows some connections to your previous dreams, suggesting developing themes in your subconscious.";
    }

    const patternText = patterns.slice(0, 3).join(', ');
    const dreamCount = similarDreams.length;
    
    return `These recurring patterns (${patternText}) appear across ${dreamCount + 1} of your dreams, suggesting these themes are significant in your subconscious mind. The repetition may indicate unresolved feelings or important life themes that deserve attention.`;
};

const addRecurringAnalysis = async (dream: any, userId: string) => {
    const recurringAnalysis = await generateRecurringAnalysisForDream(dream, userId);
    
    return {
        ...dream,
        recurringDreamAnalysis: recurringAnalysis
    };
};
