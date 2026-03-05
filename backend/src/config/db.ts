import mongoose from 'mongoose';
import 'dotenv/config';

export const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI as string).then(() => {
        console.log('Connected to MongoDB');
    });
}
