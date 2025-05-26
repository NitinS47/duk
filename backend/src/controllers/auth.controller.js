import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import VerificationToken from "../models/VerificationToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../lib/email.js";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export async function signup(req, res) {
    const { fullName, email, password } = req.body;

    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if email exists in either User or VerificationToken
        const existingUser = await User.findOne({ email });
        const existingVerification = await VerificationToken.findOne({ email });
        
        if (existingUser || existingVerification) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Check if email configuration is present
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            return res.status(500).json({ 
                message: "Email service is not configured. Please contact support." 
            });
        }

        // Generate verification token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

        console.log('Creating verification token for:', email);

        // Store verification data
        const verificationData = await VerificationToken.create({
            email,
            fullName,
            password,
            token,
            expiresAt
        });

        console.log('Verification token created:', {
            email: verificationData.email,
            token: verificationData.token,
            expiresAt: verificationData.expiresAt
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, token);
            res.status(200).json({
                success: true,
                message: "Please check your email to verify your account."
            });
        } catch (error) {
            console.error("Error sending verification email:", error);
            // Delete the verification token if email sending fails
            await VerificationToken.deleteOne({ token });
            
            // Provide more specific error messages based on the error
            if (error.code === 'EAUTH') {
                return res.status(500).json({ 
                    message: "Email authentication failed. Please check email configuration." 
                });
            } else if (error.code === 'ESOCKET') {
                return res.status(500).json({ 
                    message: "Could not connect to email server. Please try again later." 
                });
            } else {
                return res.status(500).json({ 
                    message: "Failed to send verification email. Please try again.",
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function verifyEmail(req, res) {
    try {
        const { token: verificationTokenParam } = req.params;
        console.log('=== Email Verification Process Started ===');
        console.log('Verification token from URL:', verificationTokenParam);
        
        // Find the verification token
        const verificationToken = await VerificationToken.findOne({ token: verificationTokenParam });
        console.log('Verification token details:', {
            found: !!verificationToken,
            email: verificationToken?.email,
            fullName: verificationToken?.fullName,
            expiresAt: verificationToken?.expiresAt,
            currentTime: Date.now()
        });
        
        if (!verificationToken) {
            console.log('ERROR: No verification token found in database');
            return res.status(400).json({ 
                success: false, 
                message: "Invalid verification token" 
            });
        }

        if (verificationToken.expiresAt < Date.now()) {
            console.log('ERROR: Token expired', {
                expiresAt: verificationToken.expiresAt,
                currentTime: Date.now(),
                difference: Date.now() - verificationToken.expiresAt
            });
            return res.status(400).json({ 
                success: false, 
                message: "Verification token has expired" 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: verificationToken.email });
        if (existingUser) {
            console.log('WARNING: User already exists:', existingUser.email);
            // Delete the verification token
            await VerificationToken.deleteOne({ _id: verificationToken._id });
            return res.status(400).json({ 
                success: false, 
                message: "Email already verified" 
            });
        }

        console.log('Creating new user with data:', {
            email: verificationToken.email,
            fullName: verificationToken.fullName
        });

        // Create the user with verified status
        const randomAvatar = `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100)}.png`;
        const newUser = await User.create({
            fullName: verificationToken.fullName,
            email: verificationToken.email,
            password: verificationToken.password,
            profilePicture: randomAvatar,
            isVerified: true,
            isOnboarded: false
        });

        console.log('User created successfully:', {
            id: newUser._id,
            email: newUser.email,
            isVerified: newUser.isVerified,
            isOnboarded: newUser.isOnboarded
        });

        // Create Stream user
        try {
            console.log('Creating Stream user profile...');
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePicture || "",
            });
            console.log('Stream user created successfully');
        } catch (error) {
            console.error("ERROR: Failed to create Stream user:", error);
            // Delete the user if Stream integration fails
            await User.deleteOne({ _id: newUser._id });
            return res.status(500).json({ 
                success: false,
                message: "Failed to create user profile. Please try again." 
            });
        }

        // Delete the verification token
        await VerificationToken.deleteOne({ _id: verificationToken._id });
        console.log('Verification token deleted from database');

        // Generate JWT token for immediate login
        const jwtToken = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        // Set cookie
        res.cookie("token", jwtToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        console.log('=== Email Verification Process Completed Successfully ===');
        res.status(200).json({ 
            success: true, 
            message: "Email verified successfully. You are now logged in.",
            user: {
                id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePicture: newUser.profilePicture,
                isVerified: newUser.isVerified,
                isOnboarded: newUser.isOnboarded
            }
        });
    } catch (error) {
        console.error("ERROR in verifyEmail:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to verify email. Please try again." 
        });
    }
}

export async function login(req, res) {   
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isPasswordCorrect = await user.matchPassword(password);
        if(!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });
        
        if (!user.isVerified) {
            // Generate new verification token
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

            // Store token in database
            await VerificationToken.create({
                userId: user._id,
                token: token,
                expiresAt: expiresAt
            });

            // Send new verification email
            try {
                await sendVerificationEmail(user.email, token);
            } catch (error) {
                console.error("Error sending verification email:", error);
            }

            return res.status(401).json({ 
                message: "Please verify your email before logging in",
                isVerified: false
            });
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "7d"});
        res.cookie("token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(200).json({
            success: true, 
            message: "Login successful", 
            user: user
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export function logout(req, res) {
    res.clearCookie("token");
    res.status(200).json({ success:true, message: "Logged out successfully" });
}
export async function onboard(req, res) {
    try{
        const userId = req.user._id;
        const { fullName, bio, interests, location} = req.body;
        if (!fullName || !bio || !interests || !location) {
            return res.status(400).json({ 
                message: "Please fill all fields",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !interests && "interests",
                    !location && "location"
                ].filter(Boolean), 
            });
        }
        const updatedUser = await User.findByIdAndUpdate(userId, {
           ...req.body,
           isOnboarded: true,
        }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePicture || "",
            });
            console.log(`Stream user upserted successfully for ${updatedUser.fullName}`);
        } catch (streamError) {
            console.error("Error upserting Stream user:", streamError.message);
        }

        res.status(200).json({ success: true, message: "User onboarded successfully", user: updatedUser });
    } catch (error) {
        console.error("Error in onboarding:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetTokenExpiry;
        await user.save();

        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function resendVerificationEmail(req, res) {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = verificationTokenExpiry;
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(user.email, verificationToken);
            res.status(200).json({ message: "Verification email sent successfully" });
        } catch (error) {
            console.error("Error sending verification email:", error);
            res.status(500).json({ message: "Failed to send verification email" });
        }
    } catch (error) {
        console.error("Error in resendVerificationEmail:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}