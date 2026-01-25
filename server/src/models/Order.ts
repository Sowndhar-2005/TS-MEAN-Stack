import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    foodId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
}

export interface IOrder extends Document {
    orderId: string;
    userId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    totalAmount: number;
    status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled' | 'refunded';
    cookingTimer: number;
    cookingStartTime?: Date;
    estimatedReadyTime?: Date;
    paymentMethod: 'wallet' | 'upi' | 'collegePoints';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                foodId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Food',
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
                specialInstructions: {
                    type: String,
                    trim: true,
                },
            },
        ],
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        tax: {
            type: Number,
            required: true,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'cooking', 'ready', 'delivered', 'cancelled', 'refunded'],
            default: 'pending',
        },
        cookingTimer: {
            type: Number,
            default: 15,
            min: 0,
        },
        cookingStartTime: {
            type: Date,
        },
        estimatedReadyTime: {
            type: Date,
        },
        paymentMethod: {
            type: String,
            enum: ['wallet', 'upi', 'collegePoints'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        transactionId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Generate orderId before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        // Generate unique order ID: ORD-XXXX
        const count = await mongoose.model('Order').countDocuments();
        this.orderId = `#ORD-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
