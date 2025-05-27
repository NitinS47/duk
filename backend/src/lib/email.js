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

export const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Verification OTP",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Email Verification</h2>
                <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; margin: 0; font-size: 32px;">${otp}</h1>
                </div>
                <p>This OTP will expire in 15 minutes.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}; 