import { Router } from 'express';
import userRoutes from './user.routes';
import profileRoutes from './profile.routes';
import articleRoutes from './article.routes';
import tagRoutes from './tag.routes';

const router = Router();

// Register all routes
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/articles', articleRoutes);
router.use('/tags', tagRoutes);

export default router;
