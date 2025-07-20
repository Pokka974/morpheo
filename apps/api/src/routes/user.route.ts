import express from 'express';
import { requireAuth } from '@clerk/express';
import { deleteUserData, exportUserData, getUserProfile, upsertUserProfile } from '../controllers/user.controller';

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

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the current user's profile including demographics and preferences
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/profile', requireAuth(), getUserProfile);

/**
 * @swagger
 * /user/profile:
 *   post:
 *     summary: Create or update user profile
 *     description: Create or update user profile with demographics and preferences for personalized dream interpretation
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, NON_BINARY, PREFER_NOT_TO_SAY]
 *                 example: FEMALE
 *               ageRange:
 *                 type: string
 *                 enum: [TEEN_13_17, YOUNG_ADULT_18_25, ADULT_26_35, MIDDLE_AGED_36_50, MATURE_51_65, SENIOR_65_PLUS]
 *                 example: YOUNG_ADULT_18_25
 *               culturalBackground:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Western", "European"]
 *               primaryLanguage:
 *                 type: string
 *                 example: "en"
 *               location:
 *                 type: string
 *                 example: "San Francisco, CA"
 *               interpretationStyle:
 *                 type: string
 *                 enum: [SCIENTIFIC, SPIRITUAL, PSYCHOLOGICAL, BALANCED, CULTURAL_FOCUSED]
 *                 example: BALANCED
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Internal server error
 */
router.post('/profile', requireAuth(), upsertUserProfile);

export default router;