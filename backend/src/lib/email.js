import nodemailer from 'nodemailer';

// Log email configuration (without exposing the password)
console.log('Email configuration:', {
    user: process.env.EMAIL_USER ? 'Configured' : 'Missing',
    password: process.env.EMAIL_PASSWORD ? 'Configured' : 'Missing',
    frontendUrl: process.env.FRONTEND_URL || 'Missing'
});

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    debug: true, // Enable debug output
    logger: true // Enable logger
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('SMTP connection error:', {
            message: error.message,
            code: error.code,
            command: error.command
        });
    } else {
        console.log('SMTP server is ready to take our messages');
    }
});

export const sendVerificationEmail = async (email, token) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('Email configuration is missing. Please check EMAIL_USER and EMAIL_PASSWORD environment variables.');
    }

    if (!process.env.FRONTEND_URL) {
        throw new Error('FRONTEND_URL environment variable is missing.');
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const mailOptions = {
        from: `"DUK" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to DUK - Verify Your Email',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #4F46E5; margin-bottom: 10px;">Welcome to DUK!</h1>
                    <p style="color: #6B7280; font-size: 16px;">Thank you for signing up. Please verify your email address to get started.</p>
                </div>
                
                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="margin-bottom: 20px;">To verify your email address, click the button below:</p>
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" 
                           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                </div>
                
                <p style="color: #6B7280; font-size: 14px; margin-bottom: 10px;">Or copy and paste this link into your browser:</p>
                <p style="color: #4F46E5; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                    <p style="color: #6B7280; font-size: 14px;">This link will expire in 15 minutes.</p>
                    <p style="color: #6B7280; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
                </div>
            </div>
        `
    };

    try {
        console.log('Attempting to send verification email to:', email);
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Detailed error sending verification email:', {
            error: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        });
        throw error;
    }
}; 