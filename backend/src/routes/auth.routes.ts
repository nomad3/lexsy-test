import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', login);

export default router;
