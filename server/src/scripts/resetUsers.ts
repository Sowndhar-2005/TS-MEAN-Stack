import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';

const resetUsers = async () => {
    try {
        await connectDatabase();
        console.log('🗑️  Deleting all users...');
        const result = await User.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} users.`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting users:', error);
        process.exit(1);
    }
};

resetUsers();
