import { Schema } from "mongoose";

export const userSchema: Schema = new Schema({
    email: String,
    password: String,
    username: String,
    firstname: String,
    lastname: String,
    createdAt: Date,
    updatedAt: Date,
    updatedBy: String,
    active: Boolean,
    token: String,
    role: Number,
    lastLoginAt: Date
});

userSchema.pre("save", (next) => {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    if (!this.active) {
        this.active = false;
    }
    /**
     * Role:
     * 1. Master
     * 2. Admin
     * 3. User
     */
    if (!this.role) {
        this.role = 3;
    }
    next();
});