import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/express';
import { logError, logInfo } from '../services/logger.service';

const prisma = new PrismaClient();

/**
 * Delete all user data for GDPR compliance
 * This includes all dreams and associated data
 */
export const deleteUserData = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        logInfo(`Initiating data deletion for user: ${userId}`);

        // Delete all dreams for the user
        const deletedDreams = await prisma.dream.deleteMany({
            where: {
                userId: userId,
            },
        });

        logInfo(`Deleted ${deletedDreams.count} dreams for user: ${userId}`);

        return res.status(200).json({
            success: true,
            message: 'All user data has been successfully deleted',
            deletedRecords: {
                dreams: deletedDreams.count,
            },
        });
    } catch (error) {
        logError(`Error deleting user data: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Internal server error while deleting user data',
        });
    }
};

/**
 * Export user data for GDPR compliance
 * Returns all user data in a structured format
 */
export const exportUserData = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        logInfo(`Exporting data for user: ${userId}`);

        // Get all dreams for the user
        const dreams = await prisma.dream.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const exportData = {
            userId: userId,
            exportDate: new Date().toISOString(),
            dataRetention: {
                dreams: dreams.length,
            },
            dreams: dreams.map(dream => ({
                id: dream.id,
                title: dream.title,
                description: dream.description,
                summary: dream.summary,
                advice: dream.advice,
                emotions: dream.emotions,
                keywords: dream.keywords,
                emoji: dream.emoji,
                culturalReferences: dream.culturalReferences,
                dallEPrompt: dream.dallEPrompt,
                midjourneyPrompt: dream.midjourneyPrompt,
                dalleImagePath: dream.dalleImagePath,
                createdAt: dream.createdAt,
                updatedAt: dream.updatedAt,
            })),
        };

        logInfo(`Exported ${dreams.length} dreams for user: ${userId}`);

        return res.status(200).json({
            success: true,
            data: exportData,
        });
    } catch (error) {
        logError(`Error exporting user data: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Internal server error while exporting user data',
        });
    }
};