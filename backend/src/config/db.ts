import mongoose from 'mongoose';
import { env } from './env';

interface ConnectionOptions {
  uri?: string;
  maxRetries?: number;
  retryIntervalMs?: number;
}

export const connectDB = async (options?: ConnectionOptions): Promise<typeof mongoose> => {
  const uri = options?.uri || env.MONGO_URI;
  const maxRetries = options?.maxRetries ?? 5;
  const retryIntervalMs = options?.retryIntervalMs ?? 5000;

  // Set mongoose options
  mongoose.set('strictQuery', true);

  // Monitor connection events in development/production
  if (env.NODE_ENV !== 'test') {
    mongoose.connection.on('connected', () => {
      console.log(`✅ MongoDB successfully connected to ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      return conn;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, (error as Error).message);
      if (attempt >= maxRetries) {
        mongoose.set('bufferCommands', false);
        throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts`);
      }
      // Wait before retrying (skip delay in test mode)
      if (env.NODE_ENV !== 'test') {
        await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
      }
    }
  }

  return mongoose;
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    if (env.NODE_ENV !== 'test') {
      console.log('MongoDB connection closed.');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};
