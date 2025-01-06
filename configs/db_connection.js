import mongoose from 'mongoose';
export const db_connection = async () => {
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection error');
    }
}

