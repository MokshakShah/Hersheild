import mongoose from 'mongoose';
import { config } from './config';

const MONGODB_URI = config.mongodb.uri;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new database connection...');
    console.log('MongoDB URI:', MONGODB_URI);
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Database connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('Database connection failed:', {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack
      });
      throw error;
    });
  }

  try {
    console.log('Waiting for database connection...');
    cached.conn = await cached.promise;
    console.log('Database connection established');
  } catch (e) {
    console.error('Database connection error:', {
      message: e.message,
      name: e.name,
      code: e.code,
      stack: e.stack
    });
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
