import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
    foodId: mongoose.Types.ObjectId;
    quantity: number;
    specialInstructions?: string;
    price: number;
}

export interface ICart extends Document {
    userId?: mongoose.Types.ObjectId;
    sessionId?: string;
    items: ICartItem[];
    isShared: boolean;
    sharedWith: mongoose.Types.ObjectId[];
    sharedLink?: string;
    splitBillType: 'equal' | 'individual';
    splitDetails: Map<string, number>;
    createdAt: Date;
    updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        sessionId: {
            type: String,
        },
        items: [
            {
                foodId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Food',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                specialInstructions: {
                    type: String,
                    trim: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        isShared: {
            type: Boolean,
            default: false,
        },
        sharedWith: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        sharedLink: {
            type: String,
            unique: true,
            sparse: true,
        },
        splitBillType: {
            type: String,
            enum: ['equal', 'individual'],
            default: 'equal',
        },
        splitDetails: {
            type: Map,
            of: Number,
            default: new Map(),
        },
    },
    {
        timestamps: true,
    }
);

// Index for performance
cartSchema.index({ userId: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ sharedLink: 1 });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
