import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { verifyToken } from '@/lib/jwt';

// GET - Get all contacts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the token and get user info
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    // Get all contacts for this user
    const contacts = await Contact.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      contacts
    });

  } catch (error: any) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST - Create a new contact for the authenticated user
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the token and get user info
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const body = await request.json();
    const { name, phoneNumber, relationship, isEmergency } = body;

    // Validate required fields
    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    // Format phone number with +91 prefix if not already present
    let formattedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+91')) {
      // Remove any existing +91 or country code
      const cleanNumber = phoneNumber.replace(/^(\+91|91|\+)?/, '');
      // Ensure it's 10 digits
      if (cleanNumber.length === 10) {
        formattedPhoneNumber = `+91${cleanNumber}`;
      } else {
        return NextResponse.json(
          { error: 'Phone number must be 10 digits' },
          { status: 400 }
        );
      }
    }

    // Check if contact already exists for this user
    const existingContact = await Contact.findOne({ 
      userId, 
      phoneNumber: formattedPhoneNumber 
    });

    if (existingContact) {
      return NextResponse.json(
        { error: 'Contact with this phone number already exists' },
        { status: 409 }
      );
    }

    // Create new contact
    const contact = new Contact({
      userId,
      name,
      phoneNumber: formattedPhoneNumber,
      relationship: relationship || '',
      isEmergency: isEmergency || false
    });

    await contact.save();

    return NextResponse.json({
      success: true,
      message: 'Contact created successfully',
      contact
    });

  } catch (error: any) {
    console.error('Create contact error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Contact with this phone number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
