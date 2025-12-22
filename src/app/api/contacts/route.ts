import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getSupabaseAdmin } from '@/lib/supabase';

const serializeContact = (row: any) => ({
  _id: row.id,
  id: row.id,
  userId: row.user_id,
  name: row.name,
  phoneNumber: row.phone_number,
  relationship: row.relationship,
  isEmergency: row.is_emergency,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// GET - Get all contacts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

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

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get contacts error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contacts: (data || []).map(serializeContact)
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
    const supabase = getSupabaseAdmin();

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

    const { data: existingContact, error: existingError } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .eq('phone_number', formattedPhoneNumber)
      .maybeSingle();

    if (existingError) {
      console.error('Check existing contact error:', existingError);
      return NextResponse.json(
        { error: 'Failed to verify existing contacts' },
        { status: 500 }
      );
    }

    if (existingContact) {
      return NextResponse.json(
        { error: 'Contact with this phone number already exists' },
        { status: 409 }
      );
    }

    const { data: insertedContact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        name,
        phone_number: formattedPhoneNumber,
        relationship: relationship || '',
        is_emergency: isEmergency || false,
      })
      .select('*')
      .single();

    if (insertError || !insertedContact) {
      console.error('Create contact error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact created successfully',
      contact: serializeContact(insertedContact)
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
