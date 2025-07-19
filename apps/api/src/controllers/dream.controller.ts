import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as DreamService from '../services/dream.service';
import { logError, logInfo } from '../services/logger.service';
import { getAuth } from '@clerk/express';

export const updateDreamImageURL = async (req: Request, res: Response) => {
    try {
        const { dalleImagePath } = req.body;
        const result = await DreamService.updateDreamImageURL(
            dalleImagePath,
            req.params.id,
        );

        if (!result) {
            logError('Error while updating dream image url');
            res.status(StatusCodes.NOT_FOUND).json({
                error: 'Error while updating dream image url',
            });
        }

        logInfo('Successfuly get all Users');
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        logError('Error while fetching users');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Error fetching users',
        });
    }
};

export const getAllDreams = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            logError('Unable to find related user');
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send('Unable to find related user');
        }

        const result = await DreamService.getAllDreams(userId);

        if (!result) {
            logError('Error while fetching dreams');
            res.status(StatusCodes.NOT_FOUND).json({
                error: 'Error while fetching dreams',
            });
        }

        logInfo('Successfuly get all Dreams');
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        logError('Error while fetching dreams');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Error fetching dreams',
        });
    }
};

export const getDreamById = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            logError('Unable to find related user');
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send('Unable to find related user');
        }

        const result = await DreamService.getDreamById(
            userId,
            req.params.dreamId,
        );

        if (!result) {
            logError('Error while fetching dreams');
            res.status(StatusCodes.NOT_FOUND).json({
                error: 'Error while fetching dreams',
            });
        }
        logInfo(`Successfuly get dream ${req.params.dreamId}`);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        logError('Error while fetching dreams');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Error fetching dreams',
        });
    }
};
