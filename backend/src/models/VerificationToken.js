import mongoose from 'mongoose';

const verificationTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Index for faster queries and automatic cleanup
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationTokenSchema.index({ email: 1 }, { unique: true });

const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);

export default VerificationToken; 