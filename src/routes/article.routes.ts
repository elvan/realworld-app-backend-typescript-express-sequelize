import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { CommentController } from '../controllers/comment.controller';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { validateArticle, validateComment } from '../middleware/validation';

const router = Router();
const articleController = new ArticleController();
const commentController = new CommentController();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: favorited
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of articles
 */
router.get('/', optionalAuth, articleController.getArticles);

/**
 * @swagger
 * /api/articles/feed:
 *   get:
 *     summary: Get articles from followed users
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Feed of articles
 *       401:
 *         description: Unauthorized
 */
router.get('/feed', requireAuth, articleController.getFeed);

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - article
 *             properties:
 *               article:
 *                 type: object
 *                 required:
 *                   - title
 *                   - description
 *                   - body
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   body:
 *                     type: string
 *                   tagList:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Article created successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post('/', requireAuth, validateArticle, articleController.createArticle);

/**
 * @swagger
 * /api/articles/{slug}:
 *   get:
 *     summary: Get an article by slug
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article details
 *       404:
 *         description: Article not found
 */
router.get('/:slug', optionalAuth, articleController.getArticle);

/**
 * @swagger
 * /api/articles/{slug}:
 *   put:
 *     summary: Update an article
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - article
 *             properties:
 *               article:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   body:
 *                     type: string
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Article not found
 *       422:
 *         description: Validation error
 */
router.put('/:slug', requireAuth, articleController.updateArticle);

/**
 * @swagger
 * /api/articles/{slug}:
 *   delete:
 *     summary: Delete an article
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Article not found
 */
router.delete('/:slug', requireAuth, articleController.deleteArticle);

/**
 * @swagger
 * /api/articles/{slug}/favorite:
 *   post:
 *     summary: Favorite an article
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article favorited successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */
router.post('/:slug/favorite', requireAuth, articleController.favoriteArticle);

/**
 * @swagger
 * /api/articles/{slug}/favorite:
 *   delete:
 *     summary: Unfavorite an article
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article unfavorited successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */
router.delete('/:slug/favorite', requireAuth, articleController.unfavoriteArticle);

/**
 * @swagger
 * /api/articles/{slug}/comments:
 *   get:
 *     summary: Get comments for an article
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *       404:
 *         description: Article not found
 */
router.get('/:slug/comments', optionalAuth, commentController.getComments);

/**
 * @swagger
 * /api/articles/{slug}/comments:
 *   post:
 *     summary: Add a comment to an article
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: object
 *                 required:
 *                   - body
 *                 properties:
 *                   body:
 *                     type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 *       422:
 *         description: Validation error
 */
router.post('/:slug/comments', requireAuth, validateComment, commentController.addComment);

/**
 * @swagger
 * /api/articles/{slug}/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Comment or article not found
 */
router.delete('/:slug/comments/:id', requireAuth, commentController.deleteComment);

export default router;
