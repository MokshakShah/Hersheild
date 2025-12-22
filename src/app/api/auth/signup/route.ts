import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/jwt';
import { getSupabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name cannot be more than 50 characters'),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting signup process...');

    const supabase = getSupabaseAdmin();

    const body = await request.json();
    console.log('Request body received:', { ...body, password: '[HIDDEN]' });
    
    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, phoneNumber, password } = validationResult.data;
    console.log('Validation passed, checking for existing user...');

    // Check if user already exists
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing user:', existingError);
      return NextResponse.json(
        { error: 'Failed to verify existing users' },
        { status: 500 }
      );
    }

    if (existingUser) {
      console.log('User already exists with phone number:', phoneNumber);
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 409 }
      );
    }

    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    console.log('Creating new user...');
    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name,
        phone_number: phoneNumber,
        password_hash: passwordHash,
      })
      .select('id, name, phone_number')
      .single();

    if (insertError || !insertedUser) {
      console.error('Signup insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Generate JWT token
    console.log('Generating JWT token...');
    const token = generateToken({
      userId: insertedUser.id,
      phoneNumber: insertedUser.phone_number,
      name: insertedUser.name
    });
    console.log('JWT token generated successfully');

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: insertedUser.id,
        name: insertedUser.name,
        phoneNumber: insertedUser.phone_number
      }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      path: '/'
    });

    console.log('Signup completed successfully');
    return response;

  } catch (error: any) {
    console.error('Signup error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
