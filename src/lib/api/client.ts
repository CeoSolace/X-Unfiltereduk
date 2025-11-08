// src/lib/api/client.ts
import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGO_BASE_URI) {
    throw new Error('MONGO_BASE_URI is missing in environment');
  }

  try {
    await mongoose.connect(process.env.MONGO_BASE_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw new Error('Database connection failed');
  }
}
