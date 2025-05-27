import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: "",
    },
    profilePicture: {
        type: String,
        default: "",
    },
    interests: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,

    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, {timestamps: true});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    
    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.matchPassword = async function (enteredpassword) {
    const isPasswordCorrect = await bcrypt.compare(enteredpassword, this.password);
    return isPasswordCorrect;
};

const User = mongoose.model("User", userSchema);

export default User;