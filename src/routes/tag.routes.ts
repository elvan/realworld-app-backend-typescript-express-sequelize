import { Router } from 'express';
import { TagController } from '../controllers/tag.controller';

const router = Router();
const tagController = new TagController();

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get('/', tagController.getTags);

export default router;
