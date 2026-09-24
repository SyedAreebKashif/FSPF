import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Protect all admin routes with JWT authentication & Admin role check
router.use(authenticate);
router.use(restrictTo('admin'));

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);

// Projects Management
router.get('/projects', adminController.getProjects);
router.post('/projects', adminController.createProject);
router.put('/projects/:id', adminController.updateProject);
router.delete('/projects/:id', adminController.deleteProject);

// Profile & Availability Management
router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);

// Services Management
router.get('/services', adminController.getServices);
router.post('/services', adminController.createService);
router.put('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// Process Steps Management
router.get('/process-steps', adminController.getProcessSteps);
router.post('/process-steps', adminController.createProcessStep);
router.put('/process-steps/:id', adminController.updateProcessStep);
router.delete('/process-steps/:id', adminController.deleteProcessStep);

// Inquiries / Leads Management
router.get('/inquiries', adminController.getInquiries);
router.delete('/inquiries/:id', adminController.deleteInquiry);

export default router;
