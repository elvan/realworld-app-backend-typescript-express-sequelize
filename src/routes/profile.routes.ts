import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { optionalAuth, requireAuth } from '../middleware/auth';

const router = Router();
const profileController = new ProfileController();

/**
 * @swagger
 * /api/profiles/{username}:
 *   get:
 *     summary: Get a user's profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get('/:username', optionalAuth, profileController.getProfile);

/**
 * @swagger
 * /api/profiles/{username}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User followed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/:username/follow', requireAuth, profileController.followUser);

/**
 * @swagger
 * /api/profiles/{username}/follow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/:username/follow', requireAuth, profileController.unfollowUser);

export default router;
