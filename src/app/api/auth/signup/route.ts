import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name cannot be more than 50 characters'),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting signup process...');
    
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');

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
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      console.log('User already exists with phone number:', phoneNumber);
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 409 }
      );
    }

    console.log('Creating new user...');
    // Create new user
    const user = new User({
      name,
      phoneNumber,
      password
    });

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully, ID:', user._id);

    // Generate JWT token
    console.log('Generating JWT token...');
    const token = generateToken({
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
      name: user.name
    });
    console.log('JWT token generated successfully');

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber
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
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Phone number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
