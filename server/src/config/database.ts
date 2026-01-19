import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-canteen';

export const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
        console.log(`📦 Database: ${mongoose.connection.db?.databaseName || 'campus-canteen'}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});
