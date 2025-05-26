import express from 'express';
import { signup, login, logout, onboard, verifyEmail, forgotPassword, resetPassword, resendVerificationEmail } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerificationEmail);

// Protected routes
router.post('/onboarding', protectRoute, onboard);
router.get('/me', protectRoute, (req, res) => {
    res.status(200).json({ success: "true", user: req.user });
});

export default router;