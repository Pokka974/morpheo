import { Router } from 'express';
import dallEController from '../controllers/dallE.controller';
import { requireAuth } from '@clerk/express';

const router = Router();

/**
 * @swagger
 * /dalle:
 *   post:
 *     summary: Generate an image using DALL-E based on a dream description
 *     tags: [DALL-E]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dreamDescription:
 *                 type: string
 *                 description: The dream description for generating the image.
 *                 example: "Create an image of a surreal landscape filled with floating clocks. The scenery is eerily enchanting, exuding an otherworldly beauty. Despite its eerie vibes, the picture is marked by a harmonious blend of colors. Resonating with the feel of a dream, the landscape is soothing and peaceful with an underlying theme of time, symbolized by the drifting clocks."
 *               dreamId:
 *                  type: integer
 *                  description: The related dream's id
 *                  example: 1
 *     responses:
 *       200:
 *         description: Image generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 revised_prompt:
 *                   type: string
 *                   description: The revised prompt used for generating the image.
 *                   example: "Create an image of a surreal landscape filled with floating clocks..."
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: The URL to the generated image.
 *                   example: "https://example.com/image.png"
 *       400:
 *         description: Bad request. Possible reasons include missing or invalid dream description.
 */

router.post('/', requireAuth(), dallEController.generateDallEImage);

export default router;
