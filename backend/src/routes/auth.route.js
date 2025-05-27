import express from 'express';
import { signup, login, logout, onboard, verifyOTP, forgotPassword, resetPassword, resendVerificationEmail } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerificationEmail);

// Protected routes
router.post('/onboarding', protectRoute, onboard);
router.get('/me', protectRoute, (req, res) => {
    res.status(200).json({ success: "true", user: req.user });
});

export default router;