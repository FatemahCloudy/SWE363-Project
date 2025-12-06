import mongoose from 'mongoose';

export default async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('⚠️ لا يوجد MONGODB_URI في .env — سنعمل بوضع التطوير.');
        return null;
    }
    try {
        const conn = await mongoose.connect(uri, {
            dbName: process.env.MONGODB_DBNAME
        });
        console.log('✅ MongoDB connected:', conn.connection.host);
        return conn.connection;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        return null; // نرجّع null عشان نفعّل روتات التطوير
    }
}
