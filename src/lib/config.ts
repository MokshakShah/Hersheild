export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '90d' as const, // 3 months
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://cottonshah7:hersheild%40123@hersheild.bwrhnaq.mongodb.net/safeguard-circle',
  },
  app: {
    name: 'Safeguard Circle',
    description: 'Your personal safety companion',
  }
}

// Log environment variables for debugging (remove in production)
if (typeof console !== 'undefined') {
  console.log('Environment variables check:');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Final MongoDB URI:', config.mongodb.uri);
}
