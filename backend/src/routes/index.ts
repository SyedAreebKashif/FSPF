import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';
import portfolioRoutes from './portfolio.routes';
import adminRoutes from './admin.routes';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Mount sub-routes
 */
router.use('/users', userRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/admin', adminRoutes);

export default router;
