import { Router } from 'express';
import { portfolioController } from '../controllers/portfolio.controller';

const router = Router();

router.get('/data', portfolioController.getPortfolioData);
router.get('/projects', portfolioController.getProjects);
router.get('/projects/:slug', portfolioController.getProjectBySlug);
router.post('/contact', portfolioController.submitContact);

export default router;
