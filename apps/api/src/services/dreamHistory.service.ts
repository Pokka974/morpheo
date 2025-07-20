import { PrismaClient } from '@prisma/client';
import { logInfo } from './logger.service';

const prisma = new PrismaClient();

export interface DreamSummary {
    id: string;
    title: string;
    keywords: string[];
    emotions: string[];
    createdAt: Date;
    summary: string;
}

export interface PreviousDreamsContext {
    dreamCount: number;
    summaries: DreamSummary[];
    compactSummary: string;
}

/**
 * Fetches the most recent dreams for a user (excluding the current dream being analyzed)
 * Returns up to 8 previous dreams for pattern analysis
 */
export async function getPreviousDreams(
    userId: string,
    excludeDreamId?: string,
    limit: number = 8
): Promise<DreamSummary[]> {
    const whereClause: any = { userId };
    
    if (excludeDreamId) {
        whereClause.id = { not: excludeDreamId };
    }

    const dreams = await prisma.dream.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
            id: true,
            title: true,
            keywords: true,
            emotions: true,
            createdAt: true,
            summary: true,
        },
    });

    return dreams;
}

/**
 * Creates a compact summary of previous dreams for AI context
 * Focuses on recurring themes, emotions, and patterns
 */
export function createCompactDreamSummary(dreams: DreamSummary[]): string {
    if (dreams.length === 0) {
        return '';
    }

    // Analyze recurring keywords
    const keywordFrequency: { [key: string]: number } = {};
    const emotionFrequency: { [key: string]: number } = {};

    dreams.forEach(dream => {
        dream.keywords.forEach(keyword => {
            keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
        });
        
        dream.emotions.forEach(emotion => {
            // Extract emotion without emoji for frequency counting
            const cleanEmotion = emotion.replace(/[^\w\s]/gi, '').trim().toLowerCase();
            emotionFrequency[cleanEmotion] = (emotionFrequency[cleanEmotion] || 0) + 1;
        });
    });

    // Get most frequent keywords (appearing in 2+ dreams)
    const recurringKeywords = Object.entries(keywordFrequency)
        .filter(([, count]) => count >= 2)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([keyword]) => keyword);

    // Get most frequent emotions
    const recurringEmotions = Object.entries(emotionFrequency)
        .filter(([, count]) => count >= 2)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([emotion]) => emotion);

    // Get recent dream titles and dates for context
    const recentDreams = dreams.slice(0, 5).map(dream => ({
        title: dream.title,
        date: new Date(dream.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        }),
    }));

    let summary = `Previous dreams context (${dreams.length} dreams):`;
    
    if (recurringKeywords.length > 0) {
        summary += `\nRecurring themes: ${recurringKeywords.join(', ')}.`;
    }
    
    if (recurringEmotions.length > 0) {
        summary += `\nCommon emotions: ${recurringEmotions.join(', ')}.`;
    }
    
    if (recentDreams.length > 0) {
        const dreamList = recentDreams
            .map(d => `"${d.title}" (${d.date})`)
            .join(', ');
        summary += `\nRecent dreams: ${dreamList}.`;
    }

    return summary;
}

/**
 * Analyzes if there are potential connections between current dream and previous dreams
 * Returns context for AI to use in recurring dream analysis
 */
export async function getPreviousDreamsContext(
    userId: string,
    excludeDreamId?: string
): Promise<PreviousDreamsContext> {
    try {
        logInfo(`Fetching previous dreams context for user: ${userId}`);
        
        const dreams = await getPreviousDreams(userId, excludeDreamId);
        const compactSummary = createCompactDreamSummary(dreams);
        
        logInfo(`Found ${dreams.length} previous dreams for context`);
        
        return {
            dreamCount: dreams.length,
            summaries: dreams,
            compactSummary,
        };
    } catch (error) {
        logInfo(`Error fetching previous dreams context: ${error}`);
        return {
            dreamCount: 0,
            summaries: [],
            compactSummary: '',
        };
    }
}

/**
 * Find potential keyword/emotion matches between current and previous dreams
 * Used to identify specific dreams that might be connected
 */
export function findSimilarDreams(
    currentKeywords: string[],
    currentEmotions: string[],
    previousDreams: DreamSummary[],
    threshold: number = 0.3
): Array<{ dream: DreamSummary; similarity: number; connections: string[] }> {
    const results: Array<{ dream: DreamSummary; similarity: number; connections: string[] }> = [];

    previousDreams.forEach(dream => {
        const connections: string[] = [];
        let matchCount = 0;
        let totalPossible = 0;

        // Check keyword matches
        currentKeywords.forEach(keyword => {
            totalPossible++;
            if (dream.keywords.some(k => k.toLowerCase() === keyword.toLowerCase())) {
                matchCount++;
                connections.push(`keyword: ${keyword}`);
            }
        });

        // Check emotion matches (clean emotions for comparison)
        const currentCleanEmotions = currentEmotions.map(e => 
            e.replace(/[^\w\s]/gi, '').trim().toLowerCase()
        );
        const dreamCleanEmotions = dream.emotions.map(e => 
            e.replace(/[^\w\s]/gi, '').trim().toLowerCase()
        );

        currentCleanEmotions.forEach(emotion => {
            totalPossible++;
            if (dreamCleanEmotions.includes(emotion)) {
                matchCount++;
                connections.push(`emotion: ${emotion}`);
            }
        });

        const similarity = totalPossible > 0 ? matchCount / totalPossible : 0;

        if (similarity >= threshold && connections.length > 0) {
            results.push({
                dream,
                similarity,
                connections,
            });
        }
    });

    // Sort by similarity (highest first) and return top 3
    return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);
}