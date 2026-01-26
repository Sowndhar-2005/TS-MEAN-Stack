import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-canteen';

const adminData = {
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: 'admin123', // Change this in production!
    isAdmin: true,
};

const seedAdmin = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await User.deleteMany({ isAdmin: true });
        console.log('🗑️  Deleted existing admin users');

        const admin = new User(adminData);
        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('📋 Admin Credentials:');
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);
        console.log('');
        console.log('⚠️ IMPORTANT: Change the default password in production!');

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
};

seedAdmin();
