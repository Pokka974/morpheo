import express from 'express';
import { requireAuth } from '@clerk/express';
import {
    getAllDreams,
    getDreamById,
    updateDreamImageURL,
} from '../controllers/dream.controller';

const router = express.Router();

/**
 * @swagger
 * /dreams/{id}/image-path:
 *   patch:
 *     summary: Update the image path of a dream
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the dream.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imagePath:
 *                 type: string
 *                 description: The new image URL or path.
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       200:
 *         description: Image path updated successfully.
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
 *                   example: Image path updated.
 *                 updatedDream:
 *                   $ref: '#/components/schemas/Dream'
 *       400:
 *         description: Bad request. Invalid dream ID or image path.
 *       404:
 *         description: Dream not found.
 */
router.patch('/:id/image-path', requireAuth(), updateDreamImageURL);

/**
 * @swagger
 * /dreams/all:
 *   get:
 *     summary: Retrieve all dreams for the authenticated user
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of dreams.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dream'
 *       401:
 *         description: Unauthorized.
 */
router.get('/all', requireAuth(), getAllDreams);

/**
 * @swagger
 * /dreams/{dreamId}:
 *   get:
 *     summary: Get a single dream by its ID
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dreamId
 *         required: true
 *         description: The unique identifier of the dream.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested dream.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dream'
 *       400:
 *         description: Invalid dream ID.
 *       404:
 *         description: Dream not found.
 *       401:
 *         description: Unauthorized.
 */
router.get('/:dreamId', requireAuth(), getDreamById);

export default router;
