import express from 'express';
import { requireAuth } from '@clerk/express';
import { deleteUserData, exportUserData } from '../controllers/user.controller';

const router = express.Router();

/**
 * @swagger
 * /user/delete-data:
 *   delete:
 *     summary: Delete all user data (GDPR compliance)
 *     description: Permanently deletes all user data including dreams and associated records
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All user data successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All user data has been successfully deleted"
 *                 deletedRecords:
 *                   type: object
 *                   properties:
 *                     dreams:
 *                       type: number
 *                       example: 25
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Internal server error
 */
router.delete('/delete-data', requireAuth(), deleteUserData);

/**
 * @swagger
 * /user/export-data:
 *   get:
 *     summary: Export all user data (GDPR compliance)
 *     description: Returns all user data in a structured format for data portability
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data export
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "user_123456"
 *                     exportDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     dataRetention:
 *                       type: object
 *                       properties:
 *                         dreams:
 *                           type: number
 *                           example: 25
 *                     dreams:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Dream'
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/export-data', requireAuth(), exportUserData);

export default router;