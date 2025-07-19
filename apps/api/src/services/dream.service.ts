import { PrismaClient } from '@prisma/client';

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

    return dreams;
};

export const getDreamById = async (userId: string, dreamId: string) => {
    const dream = await prisma.dream.findFirst({
        where: { id: dreamId, userId },
    });

    return dream;
};
