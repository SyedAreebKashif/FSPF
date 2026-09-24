import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require valid JWT)
router.use(authenticate);

router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.delete('/me', userController.deleteMe);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

export default router;
