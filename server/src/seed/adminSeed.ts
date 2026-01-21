import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-canteen';

const adminData = {
    name: 'Admin User',
    email: 'admin@college.edu',
    registrationNumber: 'ADMIN001',
    password: 'admin123', // Change this in production!
    userType: 'dayscholar' as const,
    isAdmin: true,
    walletBalance: 0,
    collegePoints: 0,
};

const seedAdmin = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            $or: [
                { email: adminData.email },
                { registrationNumber: adminData.registrationNumber },
                { isAdmin: true }
            ]
        });

        if (existingAdmin) {
            console.log('⚠️ Admin user already exists:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Registration Number: ${existingAdmin.registrationNumber}`);
            console.log('   To create a new admin, delete the existing one first.');
        } else {
            const admin = new User(adminData);
            await admin.save();
            console.log('✅ Admin user created successfully!');
            console.log('');
            console.log('📋 Admin Credentials:');
            console.log(`   Email: ${adminData.email}`);
            console.log(`   Registration Number: ${adminData.registrationNumber}`);
            console.log(`   Password: ${adminData.password}`);
            console.log('');
            console.log('⚠️ IMPORTANT: Change the default password in production!');
        }

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
};

seedAdmin();
