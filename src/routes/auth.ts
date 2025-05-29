import { Router } from 'express';
import { signup, login, logout, refreshToken } from '../controllers/authController';
import { googleAuth } from '../controllers/googleAuthController';

const router = Router();

router.post('/signup', signup as any);
router.post('/login', login as any);
router.post('/logout', logout as any);
router.post('/refresh-token', refreshToken as any);
router.post('/google', googleAuth as any);
// TODO: Add /reset-password endpoint

export default router;
