import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arogya';
let cachedConnection = null;
/**
 * Connect to MongoDB with automatic retry logic
 * For serverless/production, connection pooling is managed by MongoDB driver
 */
export async function connectDB() {
    if (cachedConnection) {
        console.log('Using cached database connection');
        return cachedConnection;
    }
    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxIdleTimeMS: 60000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority',
        });
        cachedConnection = conn;
        console.log(`✓ MongoDB connected: ${conn.connection.host}`);
        return conn;
    }
    catch (error) {
        console.error('✗ MongoDB connection failed:', error instanceof Error ? error.message : error);
        throw error;
    }
}
/**
 * Disconnect from MongoDB (cleanup)
 */
export async function disconnectDB() {
    if (cachedConnection) {
        await mongoose.disconnect();
        cachedConnection = null;
        console.log('✓ MongoDB disconnected');
    }
}
/**
 * Get current connection status
 */
export function getDBStatus() {
    return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
export default { connectDB, disconnectDB, getDBStatus };
