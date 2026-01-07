import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // console.log('Profile API called')
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // console.log('No auth token found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // console.log('Token found, verifying...')
    // Verify token
    let decodedToken;
    try {
      decodedToken = verifyToken(token);
      // console.log('Token verified:', decodedToken)
    } catch (error) {
      // console.log('Token verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    // console.log('Querying user with ID:', decodedToken.userId)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone_number, created_at, updated_at')
      .eq('id', decodedToken.userId)
      .maybeSingle();

    if (error) {
      // console.error('Profile lookup error:', error);
      return NextResponse.json(
        { error: 'Failed to load profile' },
        { status: 500 }
      );
    }

    if (!user) {
      // console.log('User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // console.log('User found:', user)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phone_number,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });

  } catch (error: any) {
    // console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
