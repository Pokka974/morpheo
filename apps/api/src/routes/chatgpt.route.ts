import { Router } from 'express';
import chatGptController from '../controllers/chatgpt.controller';
import { requireAuth } from '@clerk/express';

const router = Router();

/**
 * @swagger
 * /chatgpt:
 *   post:
 *     summary: Generate a text completion using ChatGPT
 *     tags: [ChatGPT]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt for generating the text completion.
 *                 example: "Once upon a time,"
 *     responses:
 *       200:
 *         description: Text completion generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completion:
 *                   type: string
 *                   description: The generated text completion.
 *                   example: "there was a little girl who lived in a cottage in the woods."
 *       400:
 *         description: Bad request. Possible reasons include missing or invalid prompt.
 */

router.post('/', requireAuth(), chatGptController.createChatGptCompletion);

export default router;
