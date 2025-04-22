import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth';
import { validateUser, validateLogin } from '../middleware/validation';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: object
 *                 required:
 *                   - username
 *                   - email
 *                   - password
 *                 properties:
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   password:
 *                     type: string
 *                     format: password
 *     responses:
 *       201:
 *         description: User successfully registered
 *       422:
 *         description: Validation error
 */
router.post('/register', validateUser, userController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: object
 *                 required:
 *                   - email
 *                   - password
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   password:
 *                     type: string
 *                     format: password
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateLogin, userController.login);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get current user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *       401:
 *         description: User not authenticated
 */
router.get('/', requireAuth, userController.getCurrentUser);

/**
 * @swagger
 * /api/user:
 *   put:
 *     summary: Update current user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *                     format: password
 *                   bio:
 *                     type: string
 *                   image:
 *                     type: string
 *                     format: uri
 *     responses:
 *       200:
 *         description: User successfully updated
 *       401:
 *         description: User not authenticated
 *       422:
 *         description: Validation error
 */
router.put('/', requireAuth, userController.updateUser);

export default router;
