import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        user_image: {
            type: String,
            required: false,
            default: null
        },
        email_verified: {
            type: Boolean,
            required: true,
            default: false
        },
        role: {
            type: String,
            required: true,
            // default: "user"
            //   enum: ["user", "admin"],
            // select: false
        }
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export {
    User,
}
