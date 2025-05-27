import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Get user from token
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
}; 