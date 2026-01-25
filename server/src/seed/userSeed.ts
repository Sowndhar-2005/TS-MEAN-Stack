import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-canteen';

const testUsers = [
    {
        name: 'John Doe',
        email: 'john@gmail.com',
        registrationNumber: '21CSR001',
        password: 'password123',
        userType: 'dayscholar' as const,
        isAdmin: false,
        department: 'CSE',
        year: 3,
        walletBalance: 3000,
        collegePoints: 50,
    },
    {
        name: 'Jane Smith',
        email: 'jane@gmail.com',
        registrationNumber: '21ECH002',
        password: 'password123',
        userType: 'hosteller' as const,
        isAdmin: false,
        department: 'ECE',
        year: 2,
        walletBalance: 2500,
        collegePoints: 100,
    },
    {
        name: 'Bob Wilson',
        email: 'bob@gmail.com',
        registrationNumber: '22AIML003',
        password: 'password123',
        userType: 'dayscholar' as const,
        isAdmin: false,
        department: 'AIML',
        year: 1,
        walletBalance: 3000,
        collegePoints: 0,
    },
    {
        name: 'Alice Brown',
        email: 'alice@gmail.com',
        registrationNumber: '20MEH004',
        password: 'password123',
        userType: 'hosteller' as const,
        isAdmin: false,
        department: 'MECH',
        year: 4,
        walletBalance: 1500,
        collegePoints: 200,
    },
];

const seedUsers = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        let created = 0;
        let skipped = 0;

        for (const userData of testUsers) {
            const existingUser = await User.findOne({
                $or: [
                    { email: userData.email },
                    { registrationNumber: userData.registrationNumber }
                ]
            });

            if (existingUser) {
                console.log(`⚠️ User already exists: ${userData.name} (${userData.registrationNumber})`);
                skipped++;
            } else {
                const user = new User(userData);
                await user.save();
                console.log(`✅ Created user: ${userData.name} (${userData.registrationNumber})`);
                created++;
            }
        }

        console.log('');
        console.log('📊 Summary:');
        console.log(`   Created: ${created} users`);
        console.log(`   Skipped: ${skipped} users (already exist)`);

        // Count total users
        const totalUsers = await User.countDocuments({ isAdmin: false });
        console.log(`   Total regular users in database: ${totalUsers}`);

    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
};

seedUsers();
