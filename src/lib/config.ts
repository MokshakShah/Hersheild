export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '90d' as const, // 3 months
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  app: {
    name: 'Hershield',
    description: 'Your personal safety companion',
  }
}

// Log environment variables for debugging (remove in production)
if (typeof console !== 'undefined') {
  console.log('Environment variables check:');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV);
}
