import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    amount: number;
    type: 'debit' | 'credit';
    paymentMethod: 'wallet' | 'upi' | 'collegePoints';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    upiTransactionId?: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
        },
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['debit', 'credit'],
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['wallet', 'upi', 'collegePoints'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        upiTransactionId: {
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ orderId: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
