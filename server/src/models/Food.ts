import mongoose, { Document, Schema } from 'mongoose';

export interface IFood extends Document {
    name: string;
    description?: string;
    price: number;
    image?: string;
    category: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner' | 'Side Dish' | 'Drinks' | 'Ice Cream';
    available: boolean;
    stockQuantity: number;
    rating?: number;
    isVegetarian: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const foodSchema = new Schema<IFood>(
    {
        name: {
            type: String,
            required: [true, 'Food name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        image: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Side Dish', 'Drinks', 'Ice Cream'],
        },
        available: {
            type: Boolean,
            default: true,
        },
        stockQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 50,
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        isVegetarian: {
            type: Boolean,
            default: false,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
foodSchema.index({ category: 1 });
foodSchema.index({ name: 'text', tags: 'text' });
foodSchema.index({ available: 1 });

export const Food = mongoose.model<IFood>('Food', foodSchema);
