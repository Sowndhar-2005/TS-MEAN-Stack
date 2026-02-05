import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    registrationNumber?: string;
    password: string;
    userType?: 'dayscholar' | 'hosteller';
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
    notifications: Array<{
        message: string;
        type: 'info' | 'success' | 'warning';
        read: boolean;
        createdAt: Date;
    }>;
    walletTransactions: Array<{
        type: 'credit' | 'debit' | 'order';
        amount: number;
        balance: number;
        reason?: string;
        orderId?: mongoose.Types.ObjectId;
        createdAt: Date;
    }>;
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
            required: false,
            unique: true,
            sparse: true,
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
            required: false,
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
        notifications: [
            {
                message: { type: String, required: true },
                type: {
                    type: String,
                    enum: ['info', 'success', 'warning'],
                    default: 'info'
                },
                read: { type: Boolean, default: false },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        walletTransactions: [
            {
                type: {
                    type: String,
                    enum: ['credit', 'debit', 'order'],
                    required: true
                },
                amount: { type: Number, required: true },
                balance: { type: Number, required: true },
                reason: { type: String },
                orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
                createdAt: { type: Date, default: Date.now },
            },
        ],
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

export const User = mongoose.model<IUser>('User', userSchema);
