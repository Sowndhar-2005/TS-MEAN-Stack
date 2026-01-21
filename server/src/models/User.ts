import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    registrationNumber: string;
    password: string;
    userType: 'dayscholar' | 'hosteller';
    isAdmin: boolean;
    department?: string;
    year?: number;
    walletBalance: number;
    collegePoints: number;
    savedCombos: Array<{
        name: string;
        items: Array<{
            foodId: mongoose.Types.ObjectId;
            quantity: number;
        }>;
    }>;
    totalSpent: number;
    totalOrders: number;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        registrationNumber: {
            type: String,
            required: [true, 'Registration number is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        userType: {
            type: String,
            enum: ['dayscholar', 'hosteller'],
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        department: {
            type: String,
            trim: true,
        },
        year: {
            type: Number,
            min: 1,
            max: 5,
        },
        walletBalance: {
            type: Number,
            default: 3000,
            min: 0,
        },
        collegePoints: {
            type: Number,
            default: 0,
            min: 0,
        },
        savedCombos: [
            {
                name: { type: String, required: true },
                items: [
                    {
                        foodId: {
                            type: Schema.Types.ObjectId,
                            ref: 'Food',
                            required: true,
                        },
                        quantity: { type: Number, required: true, min: 1 },
                    },
                ],
            },
        ],
        totalSpent: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalOrders: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ registrationNumber: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
