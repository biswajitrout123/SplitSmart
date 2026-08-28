import express from 'express';
import { logoutUser, registerUser, loginUser } from '../controllers/auth.controller.js';
import { authMiddleware, getMe } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { registerValidator, loginValidator } from '../utils/validators.js';

const router = express.Router();

router.post('/register', registerValidator, validateRequest, registerUser);
router.post('/login', loginValidator, validateRequest, loginUser);
router.get('/me', authMiddleware, getMe);
router.post('/logout', logoutUser);

export default router;